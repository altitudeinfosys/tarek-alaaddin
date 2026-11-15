import { NextRequest, NextResponse } from 'next/server'
import { setAiEnabled, notifySwitchChanged, aiSwitchUpdatedAt } from '@/lib/ai-guard'
import { verifyAckPushSignature, switchActionFrom, occurredAtFrom, isStaleSwitchEvent } from '@/lib/notify/ackpush'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// AckPush calls this when Tarek answers a push from this site's AckPush app.
// "Turn off AI" / "Turn AI back on" flip the AI switch. Every request must carry
// a valid AckPush-Signature made with ACKPUSH_WEBHOOK_SECRET.
// Delivery is at-least-once; setting the switch is idempotent.
export async function POST(request: NextRequest) {
  const secret = process.env.ACKPUSH_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const raw = await request.text()
  const valid = verifyAckPushSignature(secret, request.headers.get('ackpush-signature'), raw, Math.floor(Date.now() / 1000))
  if (!valid) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const action = switchActionFrom(payload)
  if (!action) {
    // Snoozes, expiries, and other answers need nothing from the site.
    return NextResponse.json({ ok: true, ignored: true })
  }

  if (isStaleSwitchEvent(occurredAtFrom(payload), await aiSwitchUpdatedAt())) {
    return NextResponse.json({ ok: true, ignored: 'stale' })
  }

  const enabled = action === 'enable'
  await setAiEnabled(enabled, 'ackpush')
  // A retried delivery keeps its AckPush-Delivery id, so the confirmation isn't sent twice.
  const delivery = request.headers.get('ackpush-delivery')
  notifySwitchChanged(enabled, 'your phone', delivery ? `switch:${delivery}` : undefined)
  return NextResponse.json({ ok: true, aiEnabled: enabled })
}
