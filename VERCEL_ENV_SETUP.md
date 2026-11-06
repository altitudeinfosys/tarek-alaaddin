# Vercel Environment Variables Setup

Env vars required on Vercel for `tarekalaaddin.com`. Grouped by subsystem.

For day-to-day newsletter operations see [`docs/NEWSLETTER-RUNBOOK.md`](docs/NEWSLETTER-RUNBOOK.md).

---

## Newsletter (self-hosted, Resend transport)

| Variable | Required | What it is |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Resend Pro API key. Powers welcome emails, broadcasts via cron, and audience sync. |
| `RESEND_AUDIENCE_ID` | optional | Resend audience/segment ID the site mirrors subscribers into. Defaults to the existing "General" audience (`fd886bd2-4e69-43ad-a8de-d876ec34c689`). |
| `RESEND_SENDER` | optional | From-address for emails. Default: `newsletter@tarekalaaddin.com`. |
| `RESEND_REPLY_TO` | optional | Reply-to address. Default: `tarek@tarekalaaddin.com`. |
| `DATABASE_URL` | ✅ | Neon Postgres connection string. Source of truth for subscribers. |
| `CRON_SECRET` | ✅ | Bearer token guarding the cron, the subscribers API, the sends API, and the detailed health check. Send it only in the `Authorization` header, never in a URL. |
| `ADMIN_VIEW_KEY` | ✅ | Key for the admin dashboard and operator guide URLs (`?key=`). It can view subscribers but can't trigger sends. |
| `NEWSLETTER_CUTOFF_DATE` | ✅ | ISO date. Posts dated before this NEVER email. Delete this var to pause all sends. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://www.tarekalaaddin.com`. Used in email links and canonical URLs. |

### Cloudflare Turnstile (anti-bot on `/subscribe`)

| Variable | Required | What it is |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | ✅ | Secret for server-side verification. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ✅ | Site key for the client widget. |

---

## Contact form (separate system — Mailgun)

The contact form at `/contact` uses Mailgun, not Resend. These are independent from the newsletter stack.

| Variable | Required for contact form | What it is |
|---|---|---|
| `MAILGUN_API_KEY` | ✅ | Mailgun API key. |
| `MAILGUN_DOMAIN` | ✅ | Verified Mailgun domain for sending (e.g. `mg.tarekalaaddin.com`). |

---

## Resend audience sync — one-time backfill

After adding `RESEND_API_KEY` (and optionally `RESEND_AUDIENCE_ID`) in Vercel, mirror existing DB subscribers into the Resend audience (requires Node 20+):

```bash
vercel env pull .env.local
node --env-file=.env.local scripts/sync-audience-backfill.mjs --dry-run   # see what would sync
node --env-file=.env.local scripts/sync-audience-backfill.mjs             # actually push
```

The script is idempotent — re-run any time to repair drift. The site DB stays source of truth.

---

## Adding variables to Vercel

1. Vercel project → **Settings** → **Environment Variables**
2. Add each key with its value; tick **Production**, **Preview**, **Development**.
3. **Redeploy** for changes to take effect (new builds pick them up automatically).

---

## Verifying

Unauthenticated callers to `/api/health` get a trivial `{"status":"ok"}` for uptime monitoring. To see the full env-var map (booleans only — values hidden), pass the cron secret:

```bash
curl -s https://www.tarekalaaddin.com/api/health -H "Authorization: Bearer $CRON_SECRET" | python3 -m json.tool
```

Expected keys under `configured`: `resendApi`, `resendAudienceId`, `cronSecret`, `databaseUrl`, `newsletterCutoffDate`, `turnstileSecret`, `turnstileSiteKey`, `mailgunApi`, `mailgunDomain`.

---

## Historical note

`KIT_API_KEY` and `KIT_API_BASE_URL` are not used by any current code and can be removed from Vercel env if they're still set.
