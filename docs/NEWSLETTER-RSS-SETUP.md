# Newsletter — Self-Hosted on Vercel + Resend + Neon

New blog posts are emailed to subscribers by our own cron job. No third-party newsletter service (Kit/Mailchimp/Beehiiv) — subscribers live in Postgres, emails go out via Resend, the schedule runs on Vercel Cron.

## Why self-hosted

- **$0/month** up to ~1k subscribers × 3 posts/month (Resend free tier is 3k/mo; Pro raises to 50k/mo).
- **Own the list.** Export to any provider later via `GET /api/newsletter/subscribers`.
- **Matches site design.** Email templates are hand-written HTML that mirrors the site's dark aesthetic.

## Architecture

```
Blog post published (MDX in /content/blog)
      │
      ▼
Vercel Cron (daily, 14:00 UTC)  ───►  GET /api/cron/newsletter
      │                                       │
      │                                       ├─ getAllPosts() from lib/mdx
      │                                       ├─ filter: published AND date >= NEWSLETTER_CUTOFF_DATE
      │                                       ├─ skip if already in `sends` table
      │                                       ├─ fetch active subscribers
      │                                       └─ resend.batch.send() — 100 per call
      ▼
Subscriber receives email w/ unsubscribe link
      │
      ▼
GET /api/newsletter/unsubscribe?token=...  →  marks status='unsubscribed'
```

## Files

- `lib/db/schema.ts` — Drizzle schema: `subscribers`, `sends`, `sent_to`.
- `lib/db/subscribers.ts` — `upsertSubscriber`, `markUnsubscribed`, `listActiveSubscribers`.
- `lib/db/sends.ts` — `findSendByPostSlug`, `recordSend`, `recordSentTo`.
- `lib/email/resend.ts` — Resend client + sender config.
- `lib/email/templates.ts` — `renderBlogPostEmail`, `renderWelcomeEmail` (inline HTML).
- `app/api/newsletter/subscribe/route.ts` — main form (requires Turnstile).
- `app/api/newsletter/popup-subscribe/route.ts` — popup (honeypot-protected).
- `app/api/newsletter/unsubscribe/route.ts` — one-click unsubscribe, renders HTML confirmation.
- `app/api/newsletter/subscribers/route.ts` — admin list view.
- `app/api/cron/newsletter/route.ts` — the cron endpoint (requires `Authorization: Bearer $CRON_SECRET`).
- `vercel.json` — cron schedule.
- `drizzle.config.ts` + `drizzle/` — migrations.
- `scripts/newsletter-admin.mjs` — local admin helpers: dry-run, force-send, backfill.

## Required env vars

```bash
# Database (provisioned via Vercel Marketplace → Neon)
DATABASE_URL=postgres://...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_SENDER=newsletter@tarekalaaddin.com      # optional override, defaults to this
RESEND_REPLY_TO=tarek@tarekalaaddin.com          # optional override

# Cron auth
CRON_SECRET=<generate with: openssl rand -base64 32>

# Anti-spam on main form (already in use)
TURNSTILE_SECRET_KEY=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...

# Site URL
NEXT_PUBLIC_SITE_URL=https://www.tarekalaaddin.com

# Cutoff — only email posts dated on or after this ISO date.
# Prevents blasting the entire archive on first cron run.
NEWSLETTER_CUTOFF_DATE=2026-04-19
```

## Cron details

- **Schedule:** `0 14 * * *` (14:00 UTC = 9:00 AM Central, US-friendly).
- **Hobby tier reality:** runs once per day, with ±59 min variance. Acceptable for a blog newsletter.
- **Idempotent:** `sends` table uses unique index on `post_slug` — running twice on the same post is a no-op.

## Subscriber sources

| Source | Route | Turnstile | Notes |
|--------|-------|-----------|-------|
| Main form (`/subscribe`) | `POST /api/newsletter/subscribe` | ✅ required | Captures topic preferences |
| Popup | `POST /api/newsletter/popup-subscribe` | honeypot only | Quick email+name |

Both send a welcome email on first subscribe (and on re-activation).

## Unsubscribe

Every email includes a one-click unsubscribe link: `/api/newsletter/unsubscribe?token=<unsubscribe_token>`. The token is a 32-character nanoid generated at signup — unique per subscriber and never rotates.

## Local development

```bash
# Pull env vars from Vercel
vercel env pull .env.local

# Generate migrations from the schema
npx drizzle-kit generate

# Push the migrations to Neon
npx drizzle-kit push

# Dry-run the cron against your local content
node scripts/newsletter-admin.mjs dry-run

# Force-send a single post (bypasses cutoff and already-sent check)
node scripts/newsletter-admin.mjs send <post-slug>

# Mark all existing posts as "already sent" — run this ONCE before enabling cron
node scripts/newsletter-admin.mjs backfill
```

## ⚠️ Before enabling the cron in production

**Critical step** — prevents blasting the entire 45-post archive:

1. Deploy the feature branch to a preview.
2. Provision Neon, run migrations.
3. Run `node scripts/newsletter-admin.mjs backfill` against the production DB **or** set `NEWSLETTER_CUTOFF_DATE` to a recent ISO date (e.g., today) in Vercel env.
4. Verify `SELECT COUNT(*) FROM sends` returns 45+ (or however many archive posts exist).
5. Only then merge to main — cron runs automatically on production.

## Cost projections

| Subscribers | Posts/mo | Emails/mo | Resend tier |
|-------------|----------|-----------|-------------|
| 100 | 3 | 300 | Free (3k) ✅ |
| 1,000 | 3 | 3,000 | Free cap |
| 1,000 | 10 | 10,000 | Pro ($20/mo) |
| 10,000 | 10 | 100,000 | Scale ($90/mo) |

## Migrating off later

If we ever want to move to Beehiiv/Substack/Ghost for discovery features:
```bash
curl https://www.tarekalaaddin.com/api/newsletter/subscribers > subscribers.json
```
Every major ESP accepts CSV/JSON import.
