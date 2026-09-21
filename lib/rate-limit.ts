import { NextRequest } from 'next/server'

// Small in-memory sliding-window limiter for the Claude-backed routes.
// State lives per server instance, so it is a cost guard against bursts and
// simple abuse, not a hard global quota. Swap for a shared store if that is
// ever needed.

const hits = new Map<string, number[]>()
const MAX_KEYS = 5000

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    hits.set(key, recent)
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) }
  }

  recent.push(now)
  hits.set(key, recent)

  // Keep the map bounded: drop keys whose window has fully expired
  if (hits.size > MAX_KEYS) {
    hits.forEach((times, k) => {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k)
    })
  }

  return { ok: true, retryAfter: 0 }
}
