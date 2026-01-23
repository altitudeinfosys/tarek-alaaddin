import { NextRequest, NextResponse } from 'next/server'
import Mailgun from 'mailgun.js'
import formData from 'form-data'

export const runtime = 'nodejs'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  turnstileToken: string
}

interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

  if (!TURNSTILE_SECRET_KEY) {
    console.error('Missing TURNSTILE_SECRET_KEY')
    return false
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
      }),
    })

    const data = (await response.json()) as TurnstileResponse

    if (!data.success) {
      console.error('Turnstile verification failed:', data['error-codes'])
    }

    return data.success
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
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

    const isValidToken = await verifyTurnstileToken(turnstileToken)
    if (!isValidToken) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

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
