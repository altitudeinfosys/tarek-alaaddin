import { NextResponse } from 'next/server'

/**
 * Health check — reports which env vars are set, without ever returning values.
 * Useful for quickly confirming a production deploy picked up a new env var.
 */
export async function GET() {
  const config = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configured: {
      resendApi: !!process.env.RESEND_API_KEY,
      resendAudienceId: !!process.env.RESEND_AUDIENCE_ID,
      resendSender: !!process.env.RESEND_SENDER,
      cronSecret: !!process.env.CRON_SECRET,
      databaseUrl: !!process.env.DATABASE_URL,
      newsletterCutoffDate: !!process.env.NEWSLETTER_CUTOFF_DATE,
      turnstileSecret: !!process.env.TURNSTILE_SECRET_KEY,
      turnstileSiteKey: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      mailgunApi: !!process.env.MAILGUN_API_KEY, // contact form
      mailgunDomain: !!process.env.MAILGUN_DOMAIN, // contact form
    },
    values: {
      // Non-sensitive values that help confirm which config is live.
      resendSender: process.env.RESEND_SENDER || 'newsletter@tarekalaaddin.com (default)',
      newsletterCutoffDate: process.env.NEWSLETTER_CUTOFF_DATE || null,
    },
  }

  return NextResponse.json(config)
}
