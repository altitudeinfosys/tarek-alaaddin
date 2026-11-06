#!/usr/bin/env node
/**
 * One-shot: mirror every row in the site `subscribers` table into the Resend
 * audience. Idempotent — safe to re-run. The DB stays the source of truth.
 *
 * Usage (requires Node 20+ for --env-file):
 *   node --env-file=.env.local scripts/sync-audience-backfill.mjs
 *   node --env-file=.env.local scripts/sync-audience-backfill.mjs --dry-run
 *
 * Pull env first if you don't already have .env.local:
 *   vercel env pull .env.local
 *
 * Env required:
 *   DATABASE_URL             Neon connection string
 *   RESEND_API_KEY           Resend Pro key
 *   RESEND_AUDIENCE_ID       optional — defaults to the "General" audience
 *
 * Note: the Resend SDK returns `{ data, error }` for contact calls and does
 * NOT throw on API errors. This script branches on both exceptions AND the
 * returned `error` so failed syncs are counted, never silently dropped.
 */
import { Resend } from 'resend'
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL || !process.env.RESEND_API_KEY) {
  console.error('Missing env. Run with `node --env-file=.env.local ...` (pull first with `vercel env pull .env.local`).')
  process.exit(1)
}

const DEFAULT_AUDIENCE_ID = 'fd886bd2-4e69-43ad-a8de-d876ec34c689'
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || DEFAULT_AUDIENCE_ID
const DRY_RUN = process.argv.includes('--dry-run')

const sql = neon(process.env.DATABASE_URL)
const resend = new Resend(process.env.RESEND_API_KEY)

async function upsert(email, firstName, unsubscribed) {
  // Resend's create is an upsert: an existing email succeeds with the same id.
  try {
    const { error } = await resend.contacts.create({
      email,
      firstName: firstName || undefined,
      unsubscribed,
      segments: [{ id: AUDIENCE_ID }],
    })
    if (!error) return { outcome: 'synced' }
    return { outcome: 'failed', reason: error.message || 'unknown' }
  } catch (err) {
    return {
      outcome: 'failed',
      reason: `threw: ${err?.message || String(err)}`,
    }
  }
}

async function main() {
  const rows = await sql`
    SELECT email, first_name, status
    FROM subscribers
    ORDER BY subscribed_at ASC
  `
  const total = rows.length
  const active = rows.filter((r) => r.status === 'active').length
  const unsub = rows.filter((r) => r.status === 'unsubscribed').length
  const other = total - active - unsub

  console.log(`Audience ID: ${AUDIENCE_ID}`)
  console.log(`Site DB — total: ${total} | active: ${active} | unsubscribed: ${unsub} | other: ${other}`)

  if (DRY_RUN) {
    console.log('\n[dry-run] no Resend writes performed.')
    return
  }

  let synced = 0
  let failed = 0
  const failures = []

  for (const row of rows) {
    const result = await upsert(row.email, row.first_name, row.status !== 'active')
    if (result.outcome === 'synced') synced++
    else {
      failed++
      failures.push({ email: row.email, reason: result.reason })
    }
    if ((synced + failed) % 25 === 0) {
      console.log(`  ... processed ${synced + failed}/${total}`)
    }
  }

  console.log(`\nDone. synced: ${synced} | failed: ${failed}`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  ${f.email} — ${f.reason}`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('[sync-audience-backfill] Fatal:', err)
  process.exit(1)
})
