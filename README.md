# tarekalaaddin.com

Personal site and blog, built with Next.js and deployed on Vercel.

```bash
npm install
npm run dev   # http://localhost:3004
```

## Newsletter

Subscribers live in Neon Postgres. Resend sends the email and mirrors the list in its Audience page.

- [Operator guide](docs/newsletter/operator-guide.html): subscribers, sends, metrics, schedule, and troubleshooting. Also served at `/admin/newsletter/guide?key=<CRON_SECRET>`, linked from the admin dashboard.
- [Runbook](docs/NEWSLETTER-RUNBOOK.md): manual operations and SQL.
- [Environment variables](VERCEL_ENV_SETUP.md)
