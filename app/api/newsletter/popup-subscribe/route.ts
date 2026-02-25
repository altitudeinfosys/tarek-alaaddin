import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter, addTagToSubscriber } from '@/lib/kit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, honeypot } = body

    // Honeypot: silently reject bots that fill the hidden field
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Subscribe with all topics enabled (popup doesn't offer topic selection)
    const result = await subscribeToNewsletter({
      email: trimmedEmail,
      firstName: firstName?.trim() || undefined,
    })

    if (!result.success) {
      console.error('[Popup Subscribe] Kit subscription failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to subscribe' },
        { status: 500 }
      )
    }

    // Add source-popup tag to track where subscriber came from
    if (result.subscriberId) {
      try {
        await addTagToSubscriber(result.subscriberId, 'source-popup')
      } catch (error) {
        // Don't fail the subscription if tagging fails
        console.error('[Popup Subscribe] Failed to add source-popup tag:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Popup Subscribe] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
