import { NextRequest, NextResponse } from 'next/server'
import { listRecentSends } from '@/lib/db/sends'

/**
 * Admin-only feed of recent newsletter broadcasts. Powers the "Recent sends"
 * section of the admin dashboard. Same bearer-token pattern as the subscribers
 * list so there's one secret to rotate.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await listRecentSends(50)
    const data = rows.map((s) => ({
      id: s.id,
      post_slug: s.postSlug,
      post_title: s.postTitle,
      sent_at: s.sentAt,
      recipient_count: s.recipientCount,
    }))
    return NextResponse.json({ success: true, sends: data, total: data.length })
  } catch (error) {
    console.error('[sends list] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch sends' }, { status: 500 })
  }
}
