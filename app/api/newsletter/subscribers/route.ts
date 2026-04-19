import { NextResponse } from 'next/server'
import { db, subscribers } from '@/lib/db'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt))
    const data = rows.map((sub) => ({
      id: sub.id,
      email: sub.email,
      first_name: sub.firstName,
      status: sub.status,
      source: sub.source,
      subscribed_at: sub.subscribedAt,
      unsubscribed_at: sub.unsubscribedAt,
      interests: {
        productivity: sub.interestProductivity,
        ai: sub.interestAi,
        marketing: sub.interestMarketing,
      },
    }))
    return NextResponse.json({ success: true, subscribers: data, total: data.length })
  } catch (error) {
    console.error('[subscribers list] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}
