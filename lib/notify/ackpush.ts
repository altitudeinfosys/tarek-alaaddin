import { waitUntil } from '@vercel/functions'
import { fitMessage, type AckPushMessage } from './ackpush-core'

export * from './ackpush-core'

const API = (process.env.ACKPUSH_API_URL ?? 'https://ackpush.com/v1').replace(/\/+$/, '')
const TIMEOUT_MS = 5000

/**
 * Sends a push to Tarek's phone through AckPush. Never throws and never
 * blocks: with no ACKPUSH_API_TOKEN it does nothing, and on Vercel the request
 * finishes after the response through waitUntil, so a slow or failed push
 * can't delay or break a signup or fit check.
 */
export function notifyTarek(message: AckPushMessage): void {
  const token = process.env.ACKPUSH_API_TOKEN
  if (!token) return

  const send = async () => {
    try {
      const res = await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(fitMessage({ ...message, metadata: { source: 'tarekalaaddin.com', ...message.metadata } })),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        console.error(`[ackpush] send failed (${res.status}): ${detail.slice(0, 300)}`)
      }
    } catch (error) {
      console.error('[ackpush] send failed:', error)
    }
  }

  waitUntil(send())
}
