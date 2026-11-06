import { NextRequest, NextResponse } from 'next/server'
import { upsertSubscriber } from '@/lib/db/subscribers'
import { resend, FROM, REPLY_TO } from '@/lib/email/resend'
import { renderWelcomeEmail } from '@/lib/email/templates'
import { syncContactUpsert } from '@/lib/email/audience'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// The footer form reuses this honeypot-protected endpoint. Only known values are
// recorded; anything else falls back to 'popup' so callers can't write arbitrary text.
const ALLOWED_SOURCES = ['popup', 'footer'] as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, honeypot } = body
    const source = ALLOWED_SOURCES.includes(body.source) ? body.source : 'popup'

    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Honeypot-only path: allowReactivate stays false (the default). Upserting
    // an already-unsubscribed email will return reactivationBlocked=true and
    // leave the DB row and status untouched — no welcome email, no mirror.
    const result = await upsertSubscriber({
      email,
      firstName: firstName?.trim() || null,
      source,
    })

    if (result.reactivationBlocked) {
      // Return the same "success" shape so a honeypot-bypass bot can't tell
      // the difference between "subscribed" and "silently ignored". A real
      // visitor who previously unsubscribed can re-subscribe via /subscribe
      // (which runs Turnstile).
      return NextResponse.json({ success: true })
    }

    // Mirror into Resend audience — best-effort, must not block signup.
    await syncContactUpsert({
      email: result.subscriber.email,
      firstName: result.subscriber.firstName,
    })

    if (result.isNew || result.wasReactivated) {
      try {
        const { subject, html, text } = renderWelcomeEmail({
          firstName: result.subscriber.firstName,
          unsubscribeToken: result.subscriber.unsubscribeToken,
        })
        await resend.emails.send({
          from: FROM,
          to: result.subscriber.email,
          replyTo: REPLY_TO,
          subject,
          html,
          text,
        })
      } catch (error) {
        console.error('[popup-subscribe] Welcome email failed:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[popup-subscribe] Error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
