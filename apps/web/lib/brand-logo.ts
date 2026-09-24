/**
 * Phase 27 — tenant logo upload, validated by what the bytes ARE.
 *
 * Pure (no I/O, no database) so the rules below are unit-testable, which is the
 * point: every one of them is a security decision, not a convenience.
 */

/**
 * Raster only. SVG is refused, and this is the single most important line in the
 * file.
 *
 * The logo is served from OUR origin — deliberately, so the app's CSP can stay
 * `img-src 'self'` instead of being widened to every https host on the internet.
 * But an SVG is a document, not a picture: it can contain <script>, and a
 * tenant-uploaded one opened directly at /api/branding/logo would run that
 * script in our origin, with our cookies. The decision that keeps the CSP tight
 * is exactly the decision that would make an SVG upload a stored XSS.
 *
 * Every agency has a PNG.
 */
export const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
export type LogoType = (typeof ALLOWED_LOGO_TYPES)[number]

/** A wordmark is a few KB. This is generous, and it bounds what one tenant can
 *  push into the bucket and through the proxy route on every page render. */
export const MAX_LOGO_BYTES = 512 * 1024

/**
 * What these bytes actually are, by magic number — NOT by the declared MIME
 * type or the file extension, both of which are supplied by the uploader.
 *
 * Returns null for anything unrecognised, which is what refuses a renamed .svg,
 * an HTML file, or a polyglot that claims image/png in its Content-Type header.
 */
export function sniffImageType(bytes: Uint8Array): LogoType | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  // WebP: 'RIFF' .... 'WEBP'
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

export type LogoCheck = { ok: true; contentType: LogoType } | { ok: false; error: string }

/** Validate an upload. Size first (cheap), then what the bytes really are. */
export function checkLogo(bytes: Uint8Array): LogoCheck {
  if (bytes.length === 0) return { ok: false, error: 'That file is empty.' }
  if (bytes.length > MAX_LOGO_BYTES) {
    return { ok: false, error: `Logo must be under ${Math.round(MAX_LOGO_BYTES / 1024)} KB.` }
  }
  const sniffed = sniffImageType(bytes)
  if (!sniffed) {
    return { ok: false, error: 'Upload a PNG, JPEG or WebP. SVG is not accepted.' }
  }
  return { ok: true, contentType: sniffed }
}

/**
 * Where a logo lives in the bucket.
 *
 * The org id is the whole key, so one tenant's key cannot collide with or
 * overwrite another's, and a new upload replaces the old object rather than
 * accumulating orphans. `version` busts the browser cache of the proxy route
 * without the key itself ever appearing in a URL.
 */
export function logoKey(orgId: string, version: string): string {
  return `branding/${orgId}/logo-${version}`
}
