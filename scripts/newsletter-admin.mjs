#!/usr/bin/env node
/**
 * Newsletter admin CLI — local helpers for the self-hosted newsletter.
 *
 * Usage:
 *   node scripts/newsletter-admin.mjs migrate            # generate + run migrations
 *   node scripts/newsletter-admin.mjs dry-run            # preview cron without sending
 *   node scripts/newsletter-admin.mjs send <slug>        # force-send a specific post
 *   node scripts/newsletter-admin.mjs backfill           # mark all existing posts as already-sent
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'

const cmd = process.argv[2]
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004'
const secret = process.env.CRON_SECRET

async function callCron(body) {
  if (!secret) throw new Error('CRON_SECRET not set in .env.local')
  const r = await fetch(`${SITE_URL}/api/cron/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify(body),
  })
  return r.json()
}

if (cmd === 'dry-run') {
  const result = await callCron({ dryRun: true })
  console.log(JSON.stringify(result, null, 2))
} else if (cmd === 'send') {
  const slug = process.argv[3]
  if (!slug) {
    console.error('Usage: send <slug>')
    process.exit(1)
  }
  const result = await callCron({ slug })
  console.log(JSON.stringify(result, null, 2))
} else if (cmd === 'backfill') {
  const { db } = await import('../lib/db/index.js')
  const { sends } = await import('../lib/db/schema.js')
  const contentDir = path.join(process.cwd(), 'content/blog')
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx'))
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf8')
    const title = (raw.match(/^title:\s*['"]?([^'"\n]+)['"]?/m) || [])[1] || slug
    try {
      await db.insert(sends).values({ postSlug: slug, postTitle: title, recipientCount: 0 })
      console.log(`marked as sent: ${slug}`)
    } catch (err) {
      console.log(`skip ${slug}:`, err.message)
    }
  }
} else {
  console.log('Commands: dry-run | send <slug> | backfill')
}
