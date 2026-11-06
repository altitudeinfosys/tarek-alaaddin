#!/usr/bin/env node
/**
 * One-shot: mirror every row in the site `subscribers` table into the Resend
 * audience. Idempotent — safe to re-run. The DB stays the source of truth.
 *
 * Usage:
 *   node scripts/sync-audience-backfill.mjs            # live sync
 *   node scripts/sync-audience-backfill.mjs --dry-run  # count only, no writes
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
import 'dotenv/config'
import { Resend } from 'resend'
import { neon } from '@neondatabase/serverless'

const DEFAULT_AUDIENCE_ID = 'fd886bd2-4e69-43ad-a8de-d876ec34c689'
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || DEFAULT_AUDIENCE_ID
const DRY_RUN = process.argv.includes('--dry-run')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set. Run `vercel env pull .env.local` first.')
  process.exit(1)
}
if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY not set.')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const resend = new Resend(process.env.RESEND_API_KEY)

async function upsert(email, firstName, unsubscribed) {
  // Try create first; if it returns error (likely "already exists"), fall through to update.
  try {
    const { error: createErr } = await resend.contacts.create({
      email,
      firstName: firstName || undefined,
      unsubscribed,
      segments: [{ id: AUDIENCE_ID }],
    })
    if (!createErr) return { outcome: 'created' }

    // Backfill runs with operator consent — reactivation is fine here. The
    // DB row's status is the authoritative truth for every contact.
    const { error: updateErr } = await resend.contacts.update({
      audienceId: AUDIENCE_ID,
      email,
      unsubscribed,
      ...(firstName ? { firstName } : {}),
    })
    if (!updateErr) return { outcome: 'updated' }

    return {
      outcome: 'failed',
      reason: `create: ${createErr?.message || 'unknown'}; update: ${updateErr?.message || 'unknown'}`,
    }
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

  let created = 0
  let updated = 0
  let failed = 0
  const failures = []

  for (const row of rows) {
    const result = await upsert(row.email, row.first_name, row.status !== 'active')
    if (result.outcome === 'created') created++
    else if (result.outcome === 'updated') updated++
    else {
      failed++
      failures.push({ email: row.email, reason: result.reason })
    }
    if ((created + updated + failed) % 25 === 0) {
      console.log(`  ... processed ${created + updated + failed}/${total}`)
    }
  }

  console.log(`\nDone. created: ${created} | updated: ${updated} | failed: ${failed}`)
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
