// The master switch and daily caps for the site's Claude-powered features
// (fit check and Ask AI chat).
//
// - AI_FEATURES_DISABLED=true in the environment turns both off regardless of
//   the database (needs a redeploy; the backup if the database is down).
// - The `ai_enabled` row in app_settings turns both off instantly. It is
//   flipped from the AckPush "Turn off AI" button, or POST /api/admin/ai-switch.
// - Each feature has a daily cap (UTC day). Once reached, that feature is
//   paused until the next day and Tarek gets one push about it.
//
// If the database can't be read, the switch fails open (features stay on) so a
// Neon hiccup doesn't take the fit check down; the env var is the hard stop.
import { eq, sql } from 'drizzle-orm'
import { db, appSettings, aiUsageDaily } from '@/lib/db'
import { notifyTarek, DISABLE_AI_ACTION, ENABLE_AI_ACTION } from '@/lib/notify/ackpush'

export type AiFeature = 'fit_check' | 'chat'

const SWITCH_KEY = 'ai_enabled'

const DEFAULT_CAPS: Record<AiFeature, number> = { fit_check: 30, chat: 300 }
const CAP_ENV: Record<AiFeature, string> = { fit_check: 'FIT_CHECK_DAILY_CAP', chat: 'CHAT_DAILY_CAP' }
const LABEL: Record<AiFeature, string> = { fit_check: 'Fit check', chat: 'Ask AI chat' }

export function dailyCap(feature: AiFeature): number {
  const raw = Number(process.env[CAP_ENV[feature]])
  return Number.isInteger(raw) && raw > 0 ? raw : DEFAULT_CAPS[feature]
}

const utcDay = (now = new Date()) => now.toISOString().slice(0, 10)

export async function isAiEnabled(): Promise<boolean> {
  if (process.env.AI_FEATURES_DISABLED === 'true') return false
  try {
    const rows = await db.select().from(appSettings).where(eq(appSettings.key, SWITCH_KEY)).limit(1)
    return rows[0]?.value !== 'false'
  } catch (error) {
    console.error('[ai-guard] could not read the AI switch, leaving AI on:', error)
    return true
  }
}

export async function setAiEnabled(enabled: boolean, by: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key: SWITCH_KEY, value: String(enabled), updatedBy: by })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: String(enabled), updatedBy: by, updatedAt: new Date() },
    })
}

export type AiGate = { ok: true } | { ok: false; reason: 'disabled' | 'daily_cap' }

/**
 * Checks the switch, then counts this call against today's cap. Call it right
 * before the model call, after input validation, so rejected input doesn't
 * use up the cap.
 */
export async function gateAiCall(feature: AiFeature): Promise<AiGate> {
  if (!(await isAiEnabled())) return { ok: false, reason: 'disabled' }

  const cap = dailyCap(feature)
  let count: number
  try {
    const rows = await db
      .insert(aiUsageDaily)
      .values({ day: utcDay(), feature, count: 1 })
      .onConflictDoUpdate({
        target: [aiUsageDaily.day, aiUsageDaily.feature],
        set: { count: sql`${aiUsageDaily.count} + 1` },
      })
      .returning({ count: aiUsageDaily.count })
    count = rows[0]?.count ?? 1
  } catch (error) {
    console.error('[ai-guard] could not count AI usage, allowing the call:', error)
    return { ok: true }
  }

  if (count <= cap) return { ok: true }

  // Exactly one request sees count === cap + 1, so the alert goes out once a day.
  if (count === cap + 1) {
    notifyTarek({
      title: `${LABEL[feature]} hit its daily cap (${cap})`,
      body: `${LABEL[feature]} is paused until midnight UTC. If this looks like abuse, turn AI off for the whole site.`,
      priority: 1,
      dedupe_key: `cap:${feature}:${utcDay()}`,
      thread_key: 'ai-switch',
      actions: [DISABLE_AI_ACTION],
    })
  }
  return { ok: false, reason: 'daily_cap' }
}

export async function usageToday(): Promise<Record<AiFeature, number>> {
  const rows = await db.select().from(aiUsageDaily).where(eq(aiUsageDaily.day, utcDay()))
  const out: Record<AiFeature, number> = { fit_check: 0, chat: 0 }
  for (const r of rows) if (r.feature === 'fit_check' || r.feature === 'chat') out[r.feature] = r.count
  return out
}

/** Pushes the new switch state, with the button that flips it back. */
export function notifySwitchChanged(enabled: boolean, by: string, dedupeKey?: string): void {
  notifyTarek({
    ...(dedupeKey ? { dedupe_key: dedupeKey.slice(0, 200) } : {}),
    title: enabled ? 'AI features are back on' : 'AI features are off',
    body: enabled
      ? `Fit check and Ask AI chat are running again (changed by ${by}).`
      : `Fit check and Ask AI chat now show "temporarily unavailable" (changed by ${by}).`,
    thread_key: 'ai-switch',
    actions: [enabled ? DISABLE_AI_ACTION : ENABLE_AI_ACTION],
  })
}

export const AI_UNAVAILABLE_MESSAGE: Record<'disabled' | 'daily_cap', string> = {
  disabled: 'This AI feature is temporarily unavailable. Please try again later, or reach Tarek through the contact page.',
  daily_cap: 'This AI feature has reached its limit for today. Please try again tomorrow, or reach Tarek through the contact page.',
}
