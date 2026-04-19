# Newsletter Operations Runbook

> Day-to-day guide for running the self-hosted newsletter on tarekalaaddin.com.
> For the architecture deep-dive, see [NEWSLETTER-RSS-SETUP.md](./NEWSLETTER-RSS-SETUP.md).
> For the original setup steps, see [NEWSLETTER-HANDOFF.md](./NEWSLETTER-HANDOFF.md).

---

## What's live (as of 2026-04-19)

**Stack**
- Next.js 14 App Router on Vercel (Hobby plan)
- **Database**: Neon Postgres (free tier), region `us-east-1`
- **Email**: Resend (Pro plan), sender `newsletter@tarekalaaddin.com`
- **ORM**: Drizzle
- **Scheduler**: Vercel Cron

**DNS** — Cloudflare → `tarekalaaddin.com`. SPF/DKIM records verified, sending enabled.

**Subscriber entry points**
| Surface | Route | Auth |
|---------|-------|------|
| Main form | `/subscribe` → `POST /api/newsletter/subscribe` | Turnstile |
| Popup (exit intent) | `POST /api/newsletter/popup-subscribe` | Honeypot |
| Unsubscribe | `GET /api/newsletter/unsubscribe?token=…` | token-based |
| Admin dashboard | `/admin/newsletter?key=$CRON_SECRET` | query-param key |
| Cron | `/api/cron/newsletter` | `Authorization: Bearer $CRON_SECRET` |
| Subscribers list | `GET /api/newsletter/subscribers` | `Authorization: Bearer $CRON_SECRET` |

**Cron schedule**
- Runs daily at **14:00 UTC** (`0 14 * * *`) — ~9 AM Central
- Hobby-tier timing variance: ±59 minutes
- Location: Vercel (production deployments only, not preview)

**Safety rails**
- `NEWSLETTER_CUTOFF_DATE=2026-04-18` — posts dated before this NEVER email
- 45 pre-existing posts pre-marked in `sends` table — archive cannot be blasted
- Cron refuses to run if `NEWSLETTER_CUTOFF_DATE` is missing or invalid (fails loud with 500)
- Idempotent per subscriber: if a send fails mid-batch, a replay picks up only the ones who didn't get it

**Env vars (Vercel)**
```
DATABASE_URL            — Neon connection string
CRON_SECRET             — Bearer token for cron + admin + subscribers list
RESEND_API_KEY          — Resend Pro key
NEWSLETTER_CUTOFF_DATE  — ISO date; posts older than this never email
TURNSTILE_SECRET_KEY    — Cloudflare Turnstile (spam guard on main form)
NEXT_PUBLIC_TURNSTILE_SITE_KEY
NEXT_PUBLIC_SITE_URL    — https://www.tarekalaaddin.com
RESEND_SENDER           — optional override (default: newsletter@tarekalaaddin.com)
RESEND_REPLY_TO         — optional override (default: tarek@tarekalaaddin.com)
```

---

## How the automatic flow works

```
You push a new MDX blog post to main
           │
           ▼
Vercel auto-builds & deploys to production
           │
           ▼
Next day at 14:00 UTC (±59 min)
Vercel Cron hits GET /api/cron/newsletter
           │
           ▼
/api/cron/newsletter pulls all posts via getAllPosts()
           │
           ▼
Filters: published:true AND date >= NEWSLETTER_CUTOFF_DATE
           │
           ▼
For each candidate:
  • Skip if already in `sends` table
  • Else create a `sends` row
  • Query active subscribers NOT yet in `sent_to` for this send
  • resend.batch.send() — 100 recipients per call
  • Record each delivery in `sent_to`
           │
           ▼
Subscribers receive the email
```

**Key invariant:** A post gets one `sends` row. That row gates whether the post is ever emailed again. Backfill, delete, or re-create that row to change behavior.

---

## Manual operations

All commands assume your shell is in the project root (`/Users/tarekalaaddin/Projects/code/tarek-alaaddin`) with a fresh `.env.local`:

```bash
vercel env pull .env.local            # if you don't have one or it's stale
export CRON_SECRET=$(grep '^CRON_SECRET=' .env.local | cut -d= -f2- | tr -d '"')
export DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')
export RESEND_API_KEY=$(grep '^RESEND_API_KEY=' .env.local | cut -d= -f2- | tr -d '"')
```

### 1. Dry-run — see what the cron WOULD send

Does not send any email. Returns the list of candidate posts and how many recipients each would reach.

```bash
curl -sS -X POST "https://www.tarekalaaddin.com/api/cron/newsletter" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}' | python3 -m json.tool
```

**Expected outputs:**
- `processed: 0` — no new posts. Nothing would send.
- `processed: N` with `status: dry-run` — N posts would email out on the next real run.
- `status: skipped-unpublished` — post exists but has `published: false` in frontmatter.

### 2. Send a specific post NOW (bypass the schedule)

Ignores cutoff and "already-sent" check. Actually sends email to any active subscribers who haven't received this post yet.

```bash
curl -sS -X POST "https://www.tarekalaaddin.com/api/cron/newsletter" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug": "your-post-slug"}' | python3 -m json.tool
```

**Result shapes:**
- `status: sent, recipients: N` — successfully emailed N subscribers.
- `status: already-sent-to-all` — every active subscriber already has this post. No-op.
- `status: partial, error: "..."` — some batches failed. Run again to retry the unsent ones (idempotent).

### 3. Trigger the full scheduled run on-demand

Same thing the cron does at 14:00 UTC — honors cutoff and "already-sent" checks. Useful if the scheduled run missed its window or you want to verify it works.

```bash
curl -sS -X GET "https://www.tarekalaaddin.com/api/cron/newsletter" \
  -H "Authorization: Bearer $CRON_SECRET" | python3 -m json.tool
```

### 4. View subscribers

Browser:
```
https://www.tarekalaaddin.com/admin/newsletter?key=<paste-CRON_SECRET-here>
```

API (for exports / jq):
```bash
curl -sS "https://www.tarekalaaddin.com/api/newsletter/subscribers" \
  -H "Authorization: Bearer $CRON_SECRET" | jq '.total, .subscribers[0]'
```

### 5. Export all subscribers (CSV, for migrating to another ESP)

```bash
curl -sS "https://www.tarekalaaddin.com/api/newsletter/subscribers" \
  -H "Authorization: Bearer $CRON_SECRET" | \
  jq -r '.subscribers[] | [.email, .first_name, .status, .source, .subscribed_at] | @csv' \
  > subscribers-$(date +%Y-%m-%d).csv
```

### 6. Mark a post as "already sent" (prevent future emailing)

Useful if you backdate a post or want to hide it from the newsletter.

```bash
export DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')
node -e "
import('@neondatabase/serverless').then(async ({ neon }) => {
  const sql = neon(process.env.DATABASE_URL);
  await sql\`INSERT INTO sends (post_slug, post_title, recipient_count) VALUES ('your-post-slug', 'Post Title', 0) ON CONFLICT (post_slug) DO NOTHING\`;
  console.log('marked as sent');
});
"
```

### 7. RE-send a post to everyone (danger!)

You almost never want this — it emails people who already got the post. If you truly need to (e.g. the first send had a broken link and you want to re-email):

```bash
export DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')
# Step 1: delete the sent_to records for that send_id
node -e "
import('@neondatabase/serverless').then(async ({ neon }) => {
  const sql = neon(process.env.DATABASE_URL);
  const send = await sql\`SELECT id FROM sends WHERE post_slug = 'your-post-slug'\`;
  if (!send[0]) return console.error('no send row');
  const r = await sql\`DELETE FROM sent_to WHERE send_id = \${send[0].id}\`;
  console.log('cleared sent_to for send', send[0].id);
});
"

# Step 2: force-send (idempotent — sends only to those NOT in sent_to)
curl -sS -X POST "https://www.tarekalaaddin.com/api/cron/newsletter" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug": "your-post-slug"}' | python3 -m json.tool
```

### 8. Manually unsubscribe someone

```bash
export DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')
node -e "
import('@neondatabase/serverless').then(async ({ neon }) => {
  const sql = neon(process.env.DATABASE_URL);
  const r = await sql\`UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = NOW() WHERE email = 'user@example.com' RETURNING id, email\`;
  console.log('unsubscribed:', r[0] || 'not found');
});
"
```

### 9. Quick DB sanity check

```bash
export DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')
node -e "
import('@neondatabase/serverless').then(async ({ neon }) => {
  const sql = neon(process.env.DATABASE_URL);
  const [subs] = await sql\`SELECT
    COUNT(*) FILTER (WHERE status='active') as active,
    COUNT(*) FILTER (WHERE status='unsubscribed') as unsubscribed,
    COUNT(*) as total
    FROM subscribers\`;
  const [sends] = await sql\`SELECT COUNT(*) as n FROM sends\`;
  const [deliveries] = await sql\`SELECT COUNT(*) as n FROM sent_to\`;
  console.log('Subscribers — active:', subs.active, '| unsubscribed:', subs.unsubscribed, '| total:', subs.total);
  console.log('Posts emailed:', sends.n);
  console.log('Total deliveries recorded:', deliveries.n);
});
"
```

---

## Common workflows

### Workflow A: Publish a post and let the cron handle it
```bash
# 1. Write content/blog/my-post.mdx with date: 2026-04-20, published: true
# 2. git commit + push to main
# 3. Wait. Tomorrow at 14:00 UTC (±59 min) it emails out automatically.
```

### Workflow B: Publish + email immediately
```bash
# 1. git commit + push; let Vercel deploy (~1 min)
# 2. Force-send:
curl -sS -X POST "https://www.tarekalaaddin.com/api/cron/newsletter" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug": "my-post"}' | python3 -m json.tool
```

### Workflow C: Publish a post WITHOUT emailing anyone
Option 1 — add `published: false` in frontmatter (also hides from the blog).
Option 2 — set a past date in frontmatter (before `NEWSLETTER_CUTOFF_DATE`).
Option 3 — preemptively mark it as sent (Manual op #6 above) before deploying.

### Workflow D: Pause the whole newsletter temporarily
Delete `NEWSLETTER_CUTOFF_DATE` from Vercel env (or change it to an invalid value). The cron will return 500 instead of sending. Reinstate when ready.

### Workflow E: Change the send time
Edit `vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/newsletter", "schedule": "0 16 * * *" }] }
```
Push to main. New schedule takes effect on next deploy.

---

## Troubleshooting

**"Cron ran but no email arrived."**
1. Hit the dry-run endpoint — is `processed > 0`?
2. Check `sends` table — is the post's row already there (would cause skip)?
3. Check `subscribers` table — any with `status = 'active'`?
4. Resend dashboard → Logs — was the email attempted? Bounced?

**"parseCutoff: NEWSLETTER_CUTOFF_DATE is not set"**
Env var got unset in Vercel. Re-add it via Vercel dashboard. Redeploy.

**"Unauthorized" when hitting admin or cron endpoints.**
Check that `$CRON_SECRET` matches what's in Vercel. `vercel env pull .env.local` to refresh.

**"Dry-run says 0 processed but I just published."**
- Is the post merged to main (not just on a branch)?
- Has Vercel finished deploying? Check `vercel ls` or the dashboard.
- Is `date:` in the frontmatter ≥ `NEWSLETTER_CUTOFF_DATE`?
- Is `published: true` (or absent — defaults to true)?
- Is there a `sends` row already? (Backfilled posts look sent.)

**"Partial send — some batches failed."**
The cron is idempotent — just re-run the force-send for the same slug. It skips subscribers who already got the email and retries the rest.

**"I want to test email delivery without affecting real subscribers."**
Subscribe a test email (e.g., `tarek+test@tarekalaaddin.com`), then force-send to a slug. Verify the email arrives. Unsubscribe or delete the test row after.

---

## Reference — URLs & endpoints

| Purpose | URL |
|---------|-----|
| Production site | https://www.tarekalaaddin.com |
| RSS feed | https://www.tarekalaaddin.com/feed.xml |
| Subscribe page | https://www.tarekalaaddin.com/subscribe |
| Admin dashboard | https://www.tarekalaaddin.com/admin/newsletter?key=$CRON_SECRET |
| Cron endpoint | `GET/POST /api/cron/newsletter` |
| Subscribers API | `GET /api/newsletter/subscribers` |
| Resend dashboard | https://resend.com/emails |
| Neon console | https://console.neon.tech |
| Vercel project | https://vercel.com/tarek-alaaddins-projects/tarek-alaaddin |
| GitHub repo | https://github.com/altitudeinfosys/tarek-alaaddin |

## Reference — DB tables

| Table | Purpose |
|-------|---------|
| `subscribers` | One row per email. Status, source, unsubscribe token, interests. |
| `sends` | One row per post-broadcast. Gates whether a post re-emails. |
| `sent_to` | Join table — which subscribers got which send. Enables idempotent retries. |
