/**
 * Who a one-off email goes to. Kept free of imports so it can be used by the
 * compose page, the API routes and the node:test suite alike.
 *
 *   { type: 'all' }                       every active subscriber
 *   { type: 'selected', subscriberIds }   only these subscribers, and only
 *                                         the ones that are still active
 */
export type Audience = { type: 'all' } | { type: 'selected'; subscriberIds: string[] }

export const MAX_SELECTED_RECIPIENTS = 500

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type AudienceResult = { ok: true; audience: Audience } | { ok: false; error: string }

/**
 * Validates the `audience` field of a request body. A missing audience means
 * "all", which keeps older callers (and the page before this change) working.
 */
export function parseAudience(raw: unknown): AudienceResult {
  if (raw === undefined || raw === null) return { ok: true, audience: { type: 'all' } }
  if (typeof raw !== 'object') return { ok: false, error: 'Invalid audience.' }
  const a = raw as Record<string, unknown>

  if (a.type === 'all') return { ok: true, audience: { type: 'all' } }

  if (a.type === 'selected') {
    if (!Array.isArray(a.subscriberIds)) return { ok: false, error: 'Pick at least one subscriber.' }
    const ids = Array.from(
      new Set(a.subscriberIds.filter((id): id is string => typeof id === 'string').map((id) => id.toLowerCase()))
    )
    if (ids.length === 0) return { ok: false, error: 'Pick at least one subscriber.' }
    if (ids.length > MAX_SELECTED_RECIPIENTS) {
      return { ok: false, error: `You can pick up to ${MAX_SELECTED_RECIPIENTS} subscribers. Use "All subscribers" instead.` }
    }
    if (!ids.every((id) => UUID_RE.test(id))) return { ok: false, error: 'Invalid subscriber id.' }
    return { ok: true, audience: { type: 'selected', subscriberIds: ids.sort() } }
  }

  return { ok: false, error: 'Invalid audience.' }
}

/** Case-insensitive match on email or first name, for the compose page's search box. */
export function matchesSubscriber(query: string, sub: { email: string; firstName: string | null }): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return false
  return sub.email.toLowerCase().includes(q) || (sub.firstName ?? '').toLowerCase().includes(q)
}
