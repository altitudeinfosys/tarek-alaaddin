import { resend } from './resend'

const DEFAULT_AUDIENCE_ID = 'fd886bd2-4e69-43ad-a8de-d876ec34c689' // "General" in Resend
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || DEFAULT_AUDIENCE_ID

export function audienceId(): string {
  return AUDIENCE_ID
}

function enabled(): boolean {
  return !!process.env.RESEND_API_KEY
}

export interface AudienceContactInput {
  email: string
  firstName?: string | null
}

export interface SyncOptions {
  /**
   * Whether this call is allowed to clear a prior unsubscribe on an existing
   * contact. True only when the request has strong consent verification
   * (e.g. Turnstile on /subscribe). For honeypot-only paths (popup/footer),
   * leave Resend's recorded opt-out intact: a bot/attacker cannot use an
   * unverified signup to re-subscribe someone who opted out.
   *
   * Default false.
   */
  allowReactivate?: boolean
}

/**
 * Mirror a subscriber into the Resend audience so Resend's dashboard shows
 * live counts. Best-effort — the site DB is the source of truth and a Resend
 * failure never blocks the caller.
 *
 * Checks the SDK's `{ data, error }` return (which does NOT throw on API
 * errors); logs and moves on rather than silently fail-open.
 */
export async function syncContactUpsert(
  input: AudienceContactInput,
  opts: SyncOptions = {}
): Promise<void> {
  if (!enabled()) return
  const email = input.email.trim().toLowerCase()
  const firstName = input.firstName?.trim() || undefined
  const allowReactivate = opts.allowReactivate ?? false

  try {
    const { error: createErr } = await resend.contacts.create({
      email,
      firstName,
      unsubscribed: false,
      segments: [{ id: AUDIENCE_ID }],
    })
    if (!createErr) return

    // Create failed. The expected case is "contact already exists" — which is
    // a benign no-op on an unverified path (we can't reactivate anyway) and
    // leads to an update on a verified path. Other errors (rate limit, auth,
    // network, 5xx) are transient operational problems the operator needs to
    // see, so we always log at this point. If the operator sees a rising
    // volume of these logs, they should re-run the backfill script.
    const likelyAlreadyExists = createErr.name === 'validation_error' ||
      /already exists|conflict|duplicate/i.test(createErr.message || '')
    if (!likelyAlreadyExists) {
      console.error('[audience] upsert create failed', { email, createErr })
    }

    // On an unverified path we never clear a prior unsubscribe, so there's
    // nothing more to do — the mirror diverges from the DB silently for this
    // row, surfaceable later via the backfill script.
    if (!allowReactivate) return

    const { error: updateErr } = await resend.contacts.update({
      audienceId: AUDIENCE_ID,
      email,
      unsubscribed: false,
      ...(firstName ? { firstName } : {}),
    })
    if (updateErr) {
      console.error('[audience] upsert update failed', { email, createErr, updateErr })
    }
  } catch (err) {
    console.error('[audience] upsert threw', { email, err })
  }
}

/**
 * Flip a contact to unsubscribed in Resend so the dashboard count reflects the
 * site DB. Idempotent; failures are logged, never swallowed silently.
 */
export async function syncContactUnsubscribe(email: string): Promise<void> {
  if (!enabled()) return
  const e = email.trim().toLowerCase()
  try {
    const { error } = await resend.contacts.update({
      audienceId: AUDIENCE_ID,
      email: e,
      unsubscribed: true,
    })
    if (error) {
      console.error('[audience] unsubscribe sync failed', { email: e, error })
    }
  } catch (err) {
    console.error('[audience] unsubscribe threw', { email: e, err })
  }
}
