import { timingSafeEqual } from 'crypto'

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/**
 * True when the request carries `Authorization: Bearer $CRON_SECRET`.
 * This is the key that can trigger sends; it's typed on the page each time
 * and never put in a URL.
 */
export function hasSendAuth(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || !authHeader) return false
  return safeEqual(authHeader, `Bearer ${secret}`)
}

/**
 * True when `key` matches ADMIN_VIEW_KEY, the view-only key that travels in
 * admin page URLs. It can render previews but never send.
 */
export function hasViewKey(key: string | null | undefined): boolean {
  const expected = process.env.ADMIN_VIEW_KEY
  if (!expected || !key) return false
  return safeEqual(key, expected)
}
