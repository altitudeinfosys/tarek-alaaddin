import { NextResponse } from 'next/server'

const KIT_API_KEY = process.env.KIT_API_KEY
const KIT_API_BASE_URL = process.env.KIT_API_BASE_URL || 'https://api.kit.com/v4'

export async function GET() {
  try {
    if (!KIT_API_KEY) {
      return NextResponse.json(
        { error: 'Kit API is not configured' },
        { status: 500 }
      )
    }

    // Fetch subscribers from Kit.com API
    const response = await fetch(`${KIT_API_BASE_URL}/subscribers`, {
      headers: {
        'Authorization': `Bearer ${KIT_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Kit API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform Kit API response to match our interface
    const subscribers = (data.subscribers || []).map((sub: any) => ({
      id: sub.id,
      email: sub.email_address,
      first_name: sub.first_name,
      subscribed_at: sub.created_at,
      confirmed_at: sub.confirmed_at,
      state: sub.state,
      tags: sub.tags || [],
    }))

    return NextResponse.json({
      success: true,
      subscribers,
      total: subscribers.length,
    })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}
