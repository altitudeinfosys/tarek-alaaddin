import { NextRequest, NextResponse } from 'next/server'
import Mailgun from 'mailgun.js'
import formData from 'form-data'
import { notifyTarek } from '@/lib/notify/ackpush'
import { verifyTurnstile } from '@/lib/turnstile'

export const runtime = 'nodejs'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  turnstileToken: string
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, turnstileToken } =
      (await request.json()) as ContactFormData

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return NextResponse.json({ error: 'Verification required' }, { status: 400 })
    }

    const turnstile = await verifyTurnstile(turnstileToken)
    if (turnstile === 'not_configured') console.error('Missing TURNSTILE_SECRET_KEY')
    if (turnstile !== 'ok') {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    // Push before the email, so the message still reaches Tarek's phone if Mailgun fails.
    const preview = String(message).trim()
    notifyTarek({
      title: `Contact form: ${String(subject || '').trim() || 'New inquiry'}`,
      body: `${String(name).trim()} · ${String(email).trim()}\n\n${preview.length > 600 ? `${preview.slice(0, 599)}…` : preview}`,
      priority: 1,
      thread_key: 'contact',
      metadata: { kind: 'contact' },
    })

    const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY
    const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN
    const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !RECIPIENT_EMAIL) {
      console.error('Missing Mailgun configuration')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const mailgun = new Mailgun(formData)
    const mg = mailgun.client({ username: 'api', key: MAILGUN_API_KEY })

    const result = await mg.messages.create(MAILGUN_DOMAIN, {
      from: `${name} <postmaster@${MAILGUN_DOMAIN}>`,
      to: [RECIPIENT_EMAIL],
      subject: `[Resume Contact] ${subject || 'New Inquiry'}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      'h:Reply-To': email,
    })

    console.log('Email sent successfully:', result)
    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 }
    )
  }
}
