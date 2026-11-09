import { NextRequest, NextResponse } from 'next/server'
import { hasSendAuth } from '@/lib/admin-auth'
import { parseDraft, renderDraft } from '@/lib/email/custom-send'
import { resend, FROM, REPLY_TO } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Sends one copy of the draft to a single address (the operator's own) so it
 * can be checked in a real inbox. Subject is prefixed with [Test]. The
 * unsubscribe link in a test copy uses a placeholder token and does nothing.
 */
export async function POST(request: NextRequest) {
  if (!hasSendAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json().catch(() => null)
  const parsed = parseDraft(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const to = typeof body?.to === 'string' ? body.to.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ error: 'Enter a valid test address.' }, { status: 400 })
  }

  const { subject, html, text } = renderDraft(parsed.draft, 'test-copy')
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: `[Test] ${subject}`,
      html,
      text,
      tags: [{ name: 'kind', value: 'newsletter-test' }],
    })
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true, to, id: data?.id ?? null })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[compose/test] send failed:', message)
    return NextResponse.json({ error: `Test send failed: ${message}` }, { status: 502 })
  }
}
