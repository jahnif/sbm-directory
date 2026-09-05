#!/usr/bin/env node
/**
 * Backs up the SBM Yearbook Supabase project: a pg_dump of the database
 * plus every object in the family-images storage bucket.
 *
 * Run before the annual school-year transition, or any schema migration.
 *
 *   node scripts/backup-supabase.js
 *
 * Requires in .env.local:
 *   SUPABASE_PASS               database password
 *   NEXT_PUBLIC_SUPABASE_URL    project URL
 *   SUPABASE_SERVICE_ROLE_KEY   for reading the storage bucket
 *
 * Output goes to ~/backups/sbm-yearbook/<timestamp>/ — OUTSIDE the repo,
 * because dumps contain every family's personal data.
 */

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

// The direct host (db.<ref>.supabase.co) is IPv6-only and unreachable from
// IPv4-only networks, so we use the session pooler on port 5432. The
// transaction pooler (6543) would NOT work -- pg_dump needs session mode.
const PROJECT_REF = 'eflfxgtcvmvszefuiznz'
const PG_HOST = 'aws-1-us-east-2.pooler.supabase.com'
const PG_PORT = '5432'
const PG_USER = `postgres.${PROJECT_REF}`
const BUCKET = 'family-images'

function loadEnv() {
  const file = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(file)) throw new Error('.env.local not found')
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}

function require_(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing ${name} in .env.local`)
  return v
}

async function main() {
  loadEnv()
  const pass = require_('SUPABASE_PASS')
  const url = require_('NEXT_PUBLIC_SUPABASE_URL')
  const key = require_('SUPABASE_SERVICE_ROLE_KEY')

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outDir = path.join(os.homedir(), 'backups', 'sbm-yearbook', stamp)
  fs.mkdirSync(outDir, { recursive: true })
  console.log(`Backing up to ${outDir}\n`)

  // 1. Database dump
  const dumpFile = path.join(outDir, 'database.sql')
  console.log('[1/2] Dumping database...')
  execFileSync(
    'pg_dump',
    ['-h', PG_HOST, '-p', PG_PORT, '-U', PG_USER, '-d', 'postgres',
     '--no-owner', '--no-privileges', '-f', dumpFile],
    { env: { ...process.env, PGPASSWORD: pass }, stdio: ['ignore', 'inherit', 'inherit'] }
  )
  const mb = (fs.statSync(dumpFile).size / 1024 / 1024).toFixed(2)
  console.log(`      database.sql (${mb} MB)\n`)

  // 2. Storage bucket. pg_dump does NOT cover these -- they are object
  //    storage, not database rows.
  console.log('[2/2] Downloading storage bucket...')
  const filesDir = path.join(outDir, BUCKET)
  fs.mkdirSync(filesDir, { recursive: true })

  const headers = { apikey: key, Authorization: `Bearer ${key}` }
  const names = []
  let offset = 0
  for (;;) {
    const res = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: '', limit: 100, offset }),
    })
    if (!res.ok) throw new Error(`List failed: ${res.status} ${await res.text()}`)
    const batch = await res.json()
    if (!batch.length) break
    names.push(...batch.filter((o) => o.id).map((o) => o.name))
    if (batch.length < 100) break
    offset += 100
  }
  console.log(`      ${names.length} objects to download`)

  let ok = 0
  const failed = []
  for (const name of names) {
    const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`, { headers })
    if (!res.ok) {
      failed.push(name)
      continue
    }
    const dest = path.join(filesDir, name)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
    ok++
    if (ok % 25 === 0) console.log(`      ${ok}/${names.length}`)
  }
  console.log(`      ${ok}/${names.length} downloaded`)
  if (failed.length) console.log(`      FAILED: ${failed.join(', ')}`)

  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    JSON.stringify({ timestamp: stamp, project: PROJECT_REF, objects: ok, failed }, null, 2)
  )

  console.log(`\nDone. ${outDir}`)
  if (failed.length) {
    console.log(`WARNING: ${failed.length} object(s) failed to download.`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(`\nBackup failed: ${e.message}`)
  process.exit(1)
})
