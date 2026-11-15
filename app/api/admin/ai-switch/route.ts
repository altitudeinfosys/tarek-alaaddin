import { NextRequest, NextResponse } from 'next/server'
import { hasSendAuth } from '@/lib/admin-auth'
import { isAiEnabled, setAiEnabled, notifySwitchChanged, usageToday, dailyCap } from '@/lib/ai-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Master switch for the fit check and Ask AI chat.
//   GET  → { aiEnabled, envOverride, usageToday, caps }
//   POST { enabled: boolean } → flips the database switch
// Both need `Authorization: Bearer $CRON_SECRET` (the send key, never the
// view-only key that travels in admin URLs).
async function status() {
  const [aiEnabled, usage] = await Promise.all([isAiEnabled(), usageToday().catch(() => null)])
  return {
    aiEnabled,
    envOverride: process.env.AI_FEATURES_DISABLED === 'true',
    usageToday: usage,
    caps: { fit_check: dailyCap('fit_check'), chat: dailyCap('chat') },
  }
}

export async function GET(request: NextRequest) {
  if (!hasSendAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await status())
}

export async function POST(request: NextRequest) {
  if (!hasSendAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const body = (await request.json().catch(() => null)) as { enabled?: unknown } | null
  if (typeof body?.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Body must be { "enabled": true | false }' }, { status: 400 })
  }
  await setAiEnabled(body.enabled, 'admin')
  notifySwitchChanged(body.enabled, 'the admin page')
  return NextResponse.json(await status())
}
