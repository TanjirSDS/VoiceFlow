// Applies the SQL migrations in packages/db/migrations — the single source of
// truth for the schema (Phase 19; the supabase/migrations mirror was deleted
// because it had frozen at 0008 while the real set ran to 0015).
//
//   npm run migrate                 # apply everything pending
//   npm run migrate -- --status     # list applied vs pending, change nothing
//   npm run migrate -- --dry-run    # show what would run, change nothing
//
// Needs DATABASE_URL (a direct Postgres connection, not the PostgREST URL):
// Supabase dashboard → Project Settings → Database → Connection string → URI.
//
// Idempotent: each applied file is recorded in migrations.schema_migrations and
// skipped next run. Each file runs in its own transaction, so a failure leaves
// the database on the last migration that completed — never half-applied.

import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Client } from 'pg'

const MIGRATIONS_DIR = resolve(process.cwd(), 'packages/db/migrations')
const FILENAME = /^(\d{4})_[a-z0-9_]+\.sql$/

type Migration = { version: string; file: string; sql: string; checksum: string }

function loadMigrations(): Migration[] {
  if (!existsSync(MIGRATIONS_DIR)) {
    throw new Error(`no migrations at ${MIGRATIONS_DIR} — run this from the repo root`)
  }

  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()
  if (files.length === 0) throw new Error(`no .sql files in ${MIGRATIONS_DIR}`)

  const seen = new Map<string, string>()
  return files.map((file) => {
    const m = FILENAME.exec(file)
    if (!m) throw new Error(`${file}: expected NNNN_lower_snake_case.sql`)

    // Two files sharing a number would apply in an order that depends on the
    // rest of the name — always a mistake, never a deliberate one.
    const dup = seen.get(m[1])
    if (dup) throw new Error(`duplicate migration number ${m[1]}: ${dup} and ${file}`)
    seen.set(m[1], file)

    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    return {
      version: file.replace(/\.sql$/, ''),
      file,
      sql,
      checksum: createHash('sha256').update(sql).digest('hex'),
    }
  })
}

// Own schema, not public: config.toml exposes only public + graphql_public over
// the API, so the ledger stays off PostgREST instead of relying on grants.
const LEDGER = `
  create schema if not exists migrations;
  create table if not exists migrations.schema_migrations (
    version    text primary key,
    checksum   text not null,
    applied_at timestamptz not null default now()
  );
`

async function main() {
  const statusOnly = process.argv.includes('--status')
  const dryRun = process.argv.includes('--dry-run')

  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set (see .env.example)')

  const migrations = loadMigrations()
  const client = new Client({ connectionString: url })
  await client.connect()

  try {
    // --status/--dry-run must not write, so only create the ledger when applying.
    const readOnly = statusOnly || dryRun
    if (!readOnly) await client.query(LEDGER)

    const { rows: ledger } = await client.query<{ exists: string | null }>(
      "select to_regclass('migrations.schema_migrations')::text as exists"
    )
    const { rows } = ledger[0].exists
      ? await client.query<{ version: string; checksum: string }>(
          'select version, checksum from migrations.schema_migrations'
        )
      : { rows: [] as { version: string; checksum: string }[] }
    const applied = new Map(rows.map((r) => [r.version, r.checksum]))

    // An edit to an already-applied file silently desyncs every database that
    // ran the old text — the exact drift that let the old mirror rot. Refuse.
    const drifted = migrations.filter(
      (m) => applied.has(m.version) && applied.get(m.version) !== m.checksum
    )
    if (drifted.length > 0) {
      throw new Error(
        `already applied but changed on disk: ${drifted.map((m) => m.file).join(', ')}\n` +
          'Migrations are immutable once applied — add a new one instead.'
      )
    }

    const pending = migrations.filter((m) => !applied.has(m.version))

    if (readOnly) {
      for (const m of migrations) {
        console.log(`${applied.has(m.version) ? 'applied' : 'pending'}  ${m.file}`)
      }
      console.log(`\n${applied.size} applied, ${pending.length} pending`)
      return
    }

    if (pending.length === 0) {
      console.log(`up to date — ${applied.size} migrations applied`)
      return
    }

    for (const m of pending) {
      process.stdout.write(`applying ${m.file} ... `)
      await client.query('begin')
      try {
        await client.query(m.sql)
        await client.query(
          'insert into migrations.schema_migrations (version, checksum) values ($1, $2)',
          [m.version, m.checksum]
        )
        await client.query('commit')
        console.log('ok')
      } catch (err) {
        await client.query('rollback')
        console.log('FAILED')
        throw err
      }
    }

    console.log(`\napplied ${pending.length} migration(s); ${migrations.length} total`)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(`\nmigrate: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
})
