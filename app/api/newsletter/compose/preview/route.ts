import { NextRequest, NextResponse } from 'next/server'
import { hasViewKey } from '@/lib/admin-auth'
import { parseDraft, renderDraft } from '@/lib/email/custom-send'

export const dynamic = 'force-dynamic'

/**
 * Renders the compose page's draft into the exact email HTML subscribers get.
 * Gated by the view-only key: it sends nothing.
 */
export async function POST(request: NextRequest) {
  if (!hasViewKey(request.headers.get('x-admin-view-key'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json().catch(() => null)
  const parsed = parseDraft(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { subject, html } = renderDraft(parsed.draft, 'preview')
  return NextResponse.json({ subject, html })
}
