import { NextRequest, NextResponse } from 'next/server'

/**
 * Health check.
 *
 * Unauthenticated callers get a trivial {status: 'ok'} 200 — enough for any
 * uptime monitor to confirm liveness without leaking the env-var fingerprint
 * to anyone who hits the URL.
 *
 * Authenticated callers (Bearer CRON_SECRET) get the full `configured` map
 * so operators can confirm a deploy picked up a new env var. Values are
 * still never returned — only presence booleans.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null
  const authed = !!expected && authHeader === expected

  if (!authed) {
    return NextResponse.json({ status: 'ok' })
  }

  return NextResponse.json({
    status: 'ok',
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
  })
}
