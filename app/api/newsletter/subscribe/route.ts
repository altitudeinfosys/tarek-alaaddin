import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter } from '@/lib/kit'

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, topics, turnstileToken } = body

    // Validate required fields
    if (!email || !topics) {
      return NextResponse.json(
        { error: 'Email and topics are required' },
        { status: 400 }
      )
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Please complete the verification' },
        { status: 400 }
      )
    }

    if (TURNSTILE_SECRET_KEY) {
      const turnstileResponse = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret: TURNSTILE_SECRET_KEY,
            response: turnstileToken,
          }),
        }
      )

      const turnstileData = await turnstileResponse.json()

      if (!turnstileData.success) {
        return NextResponse.json(
          { error: 'Verification failed. Please try again.' },
          { status: 400 }
        )
      }
    }

    // Subscribe to newsletter via Kit
    const result = await subscribeToNewsletter({
      email,
      firstName,
      topics,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to subscribe. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
