import { NextRequest, NextResponse } from 'next/server'
import { upsertSubscriber } from '@/lib/db/subscribers'
import { resend, FROM, REPLY_TO } from '@/lib/email/resend'
import { renderWelcomeEmail } from '@/lib/email/templates'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, honeypot } = body

    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const result = await upsertSubscriber({
      email,
      firstName: firstName?.trim() || null,
      source: 'popup',
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
