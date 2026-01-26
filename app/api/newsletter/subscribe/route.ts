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

    // Require TURNSTILE_SECRET_KEY to be configured
    if (!TURNSTILE_SECRET_KEY) {
      console.error('TURNSTILE_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // Verify Turnstile token with proper error handling
    try {
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

      if (!turnstileResponse.ok) {
        throw new Error(`Turnstile API error: ${turnstileResponse.status}`)
      }

      const turnstileData = await turnstileResponse.json()

      if (!turnstileData.success) {
        return NextResponse.json(
          { error: 'Verification failed. Please try again.' },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Turnstile verification error:', error)
      return NextResponse.json(
        { error: 'Verification failed. Please try again later.' },
        { status: 500 }
      )
    }

    // Subscribe to newsletter via Kit
    console.log('[Newsletter API] Attempting Kit subscription for:', email)
    const result = await subscribeToNewsletter({
      email,
      firstName,
      topics,
    })

    if (!result.success) {
      console.error('[Newsletter API] Kit subscription failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to subscribe. Please try again later.' },
        { status: 500 }
      )
    }

    console.log('[Newsletter API] Successfully subscribed:', email, 'with ID:', result.subscriberId)

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
