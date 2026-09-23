import { AwsClient } from 'aws4fetch'
import { getEnv } from '@voiceflow/db'
import type { RecordingStore } from './recordings'

// Phase 21 merge: Phase 22's recordings bucket, on a Railway Bucket instead of
// Supabase Storage. Plain S3 API (aws4fetch signs it — SigV4 over fetch), so an
// R2/S3 move is an env change. Railway buckets are always private (no public
// bucket URLs exist), which is the property Phase 22's design relies on.
//
// Null when the S3_* vars are absent (local dev): archiving is skipped and the
// audio route keeps streaming from the provider, as before Phase 22.
export function recordingStore(): RecordingStore | null {
  const env = getEnv()
  if (!env.S3_ENDPOINT || !env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) return null

  const aws = new AwsClient({
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    service: 's3',
    region: env.S3_REGION,
  })
  const base = new URL(env.S3_ENDPOINT)
  // Railway buckets are virtual-hosted (bucket as subdomain); older ones and
  // MinIO want path-style, hence the switch.
  const objectUrl = (path: string) => {
    const key = path.split('/').map(encodeURIComponent).join('/')
    return env.S3_FORCE_PATH_STYLE
      ? `${base.origin}/${env.S3_BUCKET}/${key}`
      : `${base.protocol}//${env.S3_BUCKET}.${base.host}/${key}`
  }
  const check = (res: Response, what: string) => {
    if (!res.ok) throw new Error(`object store ${what}: HTTP ${res.status}`)
  }

  return {
    async put(path, body, contentType) {
      check(await aws.fetch(objectUrl(path), { method: 'PUT', body, headers: { 'content-type': contentType } }), `put ${path}`)
    },

    async signedUrl(path, ttlSecs) {
      // Presigning is local math — it happily signs a key that doesn't exist.
      // Supabase's createSignedUrl refused those, and resolveRecording relies on
      // that to answer 410 for a swept object, so check first.
      const head = await aws.fetch(objectUrl(path), { method: 'HEAD' })
      if (head.status === 404) return null
      check(head, `head ${path}`)
      const url = new URL(objectUrl(path))
      url.searchParams.set('X-Amz-Expires', String(ttlSecs)) // aws4fetch defaults to 24h otherwise
      return (await aws.sign(url.toString(), { method: 'GET', aws: { signQuery: true } })).url
    },

    async remove(paths) {
      // ponytail: one DELETE per key, 20 in flight — S3 DELETE is idempotent (404
      // is fine) and API calls are free on Railway. Batch DeleteObjects (XML +
      // Content-MD5) only if a sweep ever gets slow.
      for (let i = 0; i < paths.length; i += 20) {
        await Promise.all(
          paths.slice(i, i + 20).map(async (p) => {
            const res = await aws.fetch(objectUrl(p), { method: 'DELETE' })
            if (res.status !== 404) check(res, `delete ${p}`)
          })
        )
      }
    },
  }
}
