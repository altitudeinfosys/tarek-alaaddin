import { resend } from './resend'

const DEFAULT_AUDIENCE_ID = 'fd886bd2-4e69-43ad-a8de-d876ec34c689' // "General" in Resend
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || DEFAULT_AUDIENCE_ID

function enabled(): boolean {
  return !!process.env.RESEND_API_KEY
}

export interface AudienceContactInput {
  email: string
  firstName?: string | null
}

/**
 * Mirror a subscriber into the Resend audience. Best-effort: the site DB is the
 * source of truth, so a Resend failure is logged and never blocks the caller.
 *
 * Resend's create is an upsert (an existing email returns success with the same
 * id), so call this only after the DB says the subscriber is active. The opt-out
 * gate lives in upsertSubscriber.
 */
export async function syncContactUpsert(input: AudienceContactInput): Promise<void> {
  if (!enabled()) return
  const email = input.email.trim().toLowerCase()
  try {
    const { error } = await resend.contacts.create({
      email,
      firstName: input.firstName?.trim() || undefined,
      unsubscribed: false,
      segments: [{ id: AUDIENCE_ID }],
    })
    if (error) console.error('[audience] upsert failed', { email, error })
  } catch (err) {
    console.error('[audience] upsert threw', { email, err })
  }
}

export async function syncContactUnsubscribe(email: string): Promise<void> {
  if (!enabled()) return
  const normalized = email.trim().toLowerCase()
  try {
    const { error } = await resend.contacts.update({
      audienceId: AUDIENCE_ID,
      email: normalized,
      unsubscribed: true,
    })
    if (error) console.error('[audience] unsubscribe sync failed', { email: normalized, error })
  } catch (err) {
    console.error('[audience] unsubscribe threw', { email: normalized, err })
  }
}
