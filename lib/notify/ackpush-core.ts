// Pure helpers for the AckPush integration: message shape, webhook signature
// check, and field validation. No I/O here, so it runs under `npm test`.
import { createHmac, timingSafeEqual } from 'node:crypto'

export interface AckPushAction {
  key: string
  label: string
  kind?: 'button' | 'reply' | 'snooze'
}

export interface AckPushMessage {
  title: string
  body?: string
  priority?: number
  url?: string
  actions?: AckPushAction[]
  dedupe_key?: string
  thread_key?: string
  metadata?: Record<string, unknown>
}

// Action keys the webhook acts on. Every push this site sends that offers a
// switch uses one of these.
export const DISABLE_AI_ACTION: AckPushAction = { key: 'disable_ai', label: 'Turn off AI' }
export const ENABLE_AI_ACTION: AckPushAction = { key: 'enable_ai', label: 'Turn AI back on' }

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

/** AckPush limits: title 1–200 chars, body up to 4000. */
export function fitMessage(message: AckPushMessage): AckPushMessage {
  return {
    ...message,
    title: clip(message.title.trim() || 'tarekalaaddin.com', 200),
    ...(message.body !== undefined ? { body: clip(message.body, 4000) } : {}),
  }
}

/**
 * Checks an `AckPush-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256(secret, "<t>.<raw body>")>`
 * header, rejecting timestamps more than `toleranceSeconds` away from now.
 */
export function verifyAckPushSignature(
  secret: string,
  header: string | null,
  rawBody: string,
  nowSeconds: number,
  toleranceSeconds = 300
): boolean {
  if (!secret || !header) return false
  const parts: Record<string, string> = {}
  for (const piece of header.split(',')) {
    const i = piece.indexOf('=')
    if (i > 0) parts[piece.slice(0, i).trim()] = piece.slice(i + 1).trim()
  }
  const t = Number(parts.t)
  if (!Number.isInteger(t) || !parts.v1 || Math.abs(nowSeconds - t) > toleranceSeconds) return false
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(parts.v1)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** The action a webhook asks for, or null when it isn't one this site handles. */
export function switchActionFrom(payload: unknown): 'disable' | 'enable' | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as { event?: unknown; response?: { action_key?: unknown } | null }
  if (p.event !== 'message.answered') return null
  const key = p.response?.action_key
  if (key === DISABLE_AI_ACTION.key) return 'disable'
  if (key === ENABLE_AI_ACTION.key) return 'enable'
  return null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface VisitorContact {
  name: string | null
  email: string | null
}

/**
 * Optional name/email from the fit-check form. Blank means "not given".
 * Returns an error string for values that are present but malformed.
 */
export function parseVisitorContact(name: unknown, email: unknown): { ok: true; contact: VisitorContact } | { ok: false; error: string } {
  const n = typeof name === 'string' ? name.trim() : ''
  const e = typeof email === 'string' ? email.trim() : ''
  if (name !== undefined && name !== null && typeof name !== 'string') return { ok: false, error: 'Name must be text.' }
  if (email !== undefined && email !== null && typeof email !== 'string') return { ok: false, error: 'Email must be text.' }
  if (n.length > 100) return { ok: false, error: 'Name is too long.' }
  if (e.length > 200 || (e && !EMAIL_RE.test(e))) return { ok: false, error: 'Please enter a valid email, or leave it blank.' }
  return { ok: true, contact: { name: n || null, email: e || null } }
}

/** First non-empty line of the job description, as a hint of which role it was. */
export function jobHint(jobDescription: string, max = 140): string {
  const line = jobDescription.split('\n').map((l) => l.trim()).find(Boolean) ?? ''
  return clip(line, max)
}
