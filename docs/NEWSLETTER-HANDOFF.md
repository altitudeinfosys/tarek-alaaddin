# Newsletter Handoff — Steps Remaining

> PR: https://github.com/altitudeinfosys/tarek-alaaddin/pull/62
> Branch: `feature/self-hosted-newsletter`
> Date: 2026-04-18

## What's done (autonomously)

- ✅ Feature branch created, code committed, PR open
- ✅ Full newsletter stack built: Drizzle schema, Resend wrapper, email templates, API routes, cron endpoint
- ✅ Kit removed (`lib/kit.ts`, `types/kit.ts`), forms still work (same API contracts)
- ✅ Resend API key copied from Taskitos project into `.env.local`
- ✅ Drizzle migration SQL generated at `drizzle/0000_cute_bill_hollister.sql`
- ✅ Domain `tarekalaaddin.com` registered in Resend (ID `2af9a1fd-cc0c-4306-b43a-9891f580415c`, status `not_started`)
- ✅ Next.js build passes
- ✅ TypeScript passes

## What you need to do (in this order)

### 1. Add DNS records in Cloudflare (~3 min)

Go to Cloudflare dashboard → `tarekalaaddin.com` → DNS → Records → Add record.

Add these three records exactly:

**Record 1 — DKIM (TXT)**
- Type: `TXT`
- Name: `resend._domainkey`
- Content:
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC5guvvCHrXDJs17jFTbn8MwMujx4LuYOaIBABFeuhYW63Q8YFJU8bnYq3n5BrnkQmrJGPrtd+gOE7nf0o7B4cPNhI/MqiEEZ8RGQrBTTaMabT2jsq1aoCtrsHnV9Af9vVTFF+RLEs8yT7EgrAxqXrOKUDp8NmlmL3+tcO6cFV1CQIDAQAB
```
- **Important:** In Cloudflare, set proxy status to **DNS only** (grey cloud), not proxied.
- TTL: Auto

**Record 2 — SPF (MX)**
- Type: `MX`
- Name: `send`
- Mail server: `feedback-smtp.us-east-1.amazonses.com`
- Priority: `10`
- TTL: Auto

**Record 3 — SPF (TXT)**
- Type: `TXT`
- Name: `send`
- Content: `v=spf1 include:amazonses.com ~all`
- TTL: Auto

### 2. Verify domain in Resend

Either click **Verify DNS** at https://resend.com/domains/2af9a1fd-cc0c-4306-b43a-9891f580415c, or run:
```bash
RESEND_API_KEY=$(grep ^RESEND_API_KEY= .env.local | cut -d= -f2- | tr -d '"') && \
curl -X POST "https://api.resend.com/domains/2af9a1fd-cc0c-4306-b43a-9891f580415c/verify" \
  -H "Authorization: Bearer $RESEND_API_KEY"
```

Cloudflare DNS usually propagates in 1–2 minutes. Wait a bit if the first verify attempt fails.

### 3. Provision Neon Postgres

Option A (Vercel Marketplace, recommended):
1. https://vercel.com/tarek-2275/tarek-alaaddin/integrations
2. Browse Marketplace → Neon → Install
3. Pick the **Free** plan
4. Let Vercel auto-provision — it creates `DATABASE_URL` in all environments (production, preview, development)

Option B (Neon standalone):
1. Sign up at https://neon.tech (free tier: 500MB)
2. Create a project + database
3. Copy connection string
4. Add `DATABASE_URL` to Vercel env vars manually (all three environments)

### 4. Pull env vars + run migrations locally

```bash
cd /Users/tarekalaaddin/Projects/code/tarek-alaaddin
vercel link            # if not already linked
vercel env pull .env.local

# Push the schema to Neon
npx drizzle-kit push
```

### 5. Add remaining env vars to Vercel

Either via dashboard (Settings → Environment Variables) or CLI. Required:

```bash
# Generate a strong cron secret (ONE TIME)
vercel env add CRON_SECRET production
# Paste: (output of) openssl rand -base64 32

# Same value to preview and dev so local testing works
vercel env add CRON_SECRET preview
vercel env add CRON_SECRET development

# Sender addresses (both optional — defaults match what we want)
vercel env add RESEND_SENDER production    # newsletter@tarekalaaddin.com
vercel env add RESEND_REPLY_TO production  # tarek@tarekalaaddin.com

# CRITICAL — prevents archive blast on first cron run
# Set to today's date or later
vercel env add NEWSLETTER_CUTOFF_DATE production  # 2026-04-18
vercel env add NEWSLETTER_CUTOFF_DATE preview     # 2026-04-18
vercel env add NEWSLETTER_CUTOFF_DATE development # 2026-04-18
```

Then re-pull to local:
```bash
vercel env pull .env.local
```

### 6. Backfill existing posts as "already sent"

**This is the single most important step.** Without it, the first cron run will email your subscribers 45 times in a row (once per archive post).

Two ways:

**Way A (recommended, explicit):** use the script.
```bash
node scripts/newsletter-admin.mjs backfill
```
This inserts a `sends` row for every existing MDX post. After this, only NEW posts trigger emails.

**Way B:** rely on `NEWSLETTER_CUTOFF_DATE` — posts older than the cutoff never email. You already set this in step 5, so this is belt-and-suspenders safe. Do both.

### 7. Deploy the preview + test

Vercel auto-builds on push. Open the preview URL (https://tarek-alaaddin-git-feature-self-hosted-newsletter-tarek-2275.vercel.app or similar):

- [ ] Sign up via the footer form → check email arrives from `newsletter@tarekalaaddin.com`
- [ ] Click the welcome email's unsubscribe link → see "Unsubscribed" page
- [ ] Sign up again → verify re-activation works
- [ ] Test cron dry-run:
```bash
CRON_SECRET=$(grep ^CRON_SECRET= .env.local | cut -d= -f2- | tr -d '"')
curl -X POST "https://<preview-url>/api/cron/newsletter" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'
```
  Should return JSON listing candidate posts (ideally zero if backfill worked + cutoff is today).

- [ ] Force-send a single post to yourself:
```bash
curl -X POST "https://<preview-url>/api/cron/newsletter" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug": "<any-existing-post-slug>"}'
```
  Verify the email arrives and looks good.

### 8. Merge to main

Once everything above works:
```bash
gh pr merge 62 --merge
```
Cron begins running automatically on production (daily at 14:00 UTC, ±59 min).

---

## Reference

### Cost projection (reality check)
At 100 subs × 3 posts/mo = 300 emails/mo → Resend free tier fits 10× over. You'll pay $0/mo until roughly 1,000 subscribers.

### Admin
- Subscriber list: `https://www.tarekalaaddin.com/admin/newsletter`
- Raw count via API: `curl https://www.tarekalaaddin.com/api/newsletter/subscribers | jq .total`

### Rollback
Nothing irreversible has been deployed yet. If anything goes wrong:
- Close PR #62 without merging → main is untouched
- Delete Resend domain: `DELETE /domains/2af9a1fd-cc0c-4306-b43a-9891f580415c`
- Delete Cloudflare DNS records

### Future migration
If we move to Beehiiv/Substack later for discovery:
```bash
curl https://www.tarekalaaddin.com/api/newsletter/subscribers > subscribers.json
```
Import the resulting file into any ESP.
