import { NextRequest, NextResponse } from 'next/server'
import { hasSendAuth } from '@/lib/admin-auth'
import {
  countRecipients,
  findCustomSend,
  isValidSendKey,
  parseDraft,
  sendCustomToSubscribers,
} from '@/lib/email/custom-send'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Sends a one-off email to all active subscribers.
 *
 * Two calls from the compose page:
 *   1. { dryRun: true }  → returns how many people it would reach.
 *   2. { expectedRecipients: n } → sends, but only if n still matches the
 *      current count, so the operator confirms the number they actually saw.
 *
 * `sendKey` is unique per draft. Re-sending with the same key resumes a
 * partial send and skips everyone already emailed.
 */
export async function POST(request: NextRequest) {
  if (!hasSendAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json().catch(() => null)
  const parsed = parseDraft(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  if (!isValidSendKey(body?.sendKey)) {
    return NextResponse.json({ error: 'Missing or invalid sendKey.' }, { status: 400 })
  }
  const sendKey: string = body.sendKey

  const existing = await findCustomSend(sendKey)
  if (existing && existing.postTitle !== parsed.draft.subject) {
    return NextResponse.json(
      { error: 'This draft was already sent with a different subject. Start a new email instead.' },
      { status: 409 }
    )
  }

  const { recipients, alreadySent } = await countRecipients(sendKey)

  if (body?.dryRun) {
    return NextResponse.json({ dryRun: true, recipients, alreadySent })
  }

  if (typeof body?.expectedRecipients !== 'number' || body.expectedRecipients !== recipients) {
    return NextResponse.json(
      { error: 'The recipient count changed. Review the new number and confirm again.', recipients, alreadySent },
      { status: 409 }
    )
  }
  if (recipients === 0) {
    return NextResponse.json({ status: 'already-sent-to-all', recipients: alreadySent })
  }

  try {
    const result = await sendCustomToSubscribers(sendKey, parsed.draft)
    return NextResponse.json(result, { status: result.status === 'partial' ? 207 : 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[compose/send] failed:', message)
    return NextResponse.json({ error: `Send failed: ${message}` }, { status: 500 })
  }
}
