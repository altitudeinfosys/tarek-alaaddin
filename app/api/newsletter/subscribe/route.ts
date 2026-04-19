import { NextRequest, NextResponse } from 'next/server'
import { upsertSubscriber } from '@/lib/db/subscribers'
import { resend, FROM, REPLY_TO } from '@/lib/email/resend'
import { renderWelcomeEmail } from '@/lib/email/templates'

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, topics, turnstileToken } = body

    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!topics || typeof topics !== 'object') {
      return NextResponse.json({ error: 'Topic preferences are required' }, { status: 400 })
    }

    if (!turnstileToken) {
      return NextResponse.json({ error: 'Please complete the verification' }, { status: 400 })
    }

    if (!TURNSTILE_SECRET_KEY) {
      console.error('[subscribe] TURNSTILE_SECRET_KEY is not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: TURNSTILE_SECRET_KEY, response: turnstileToken }),
      }
    )
    const turnstileData = await turnstileResponse.json().catch(() => ({}))
    if (!turnstileData.success) {
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 400 }
      )
    }

    const result = await upsertSubscriber({
      email,
      firstName: firstName?.trim() || null,
      source: 'form',
      interests: {
        productivity: !!topics.productivity,
        ai: !!topics.ai,
        marketing: !!topics.marketing,
      },
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
        console.error('[subscribe] Welcome email failed:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    })
  } catch (error) {
    console.error('[subscribe] Error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
