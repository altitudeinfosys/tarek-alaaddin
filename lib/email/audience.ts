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

/**
 * Mirror a subscriber into the Resend audience so Resend's dashboard shows live
 * counts. Best-effort — the site DB is the source of truth and a Resend failure
 * must never block the caller.
 *
 * Strategy: try create; on failure assume it already exists and update to make
 * sure the state (firstName, unsubscribed=false) is in sync.
 */
export async function syncContactUpsert(input: AudienceContactInput): Promise<void> {
  if (!enabled()) return
  const email = input.email.trim().toLowerCase()
  const firstName = input.firstName?.trim() || undefined

  try {
    await resend.contacts.create({
      email,
      firstName,
      unsubscribed: false,
      segments: [{ id: AUDIENCE_ID }],
    })
    return
  } catch (createErr) {
    try {
      await resend.contacts.update({
        audienceId: AUDIENCE_ID,
        email,
        unsubscribed: false,
        ...(firstName ? { firstName } : {}),
      })
    } catch (updateErr) {
      console.error('[audience] upsert failed', { email, createErr, updateErr })
    }
  }
}

/**
 * Flip a contact to unsubscribed in Resend so the dashboard count reflects the
 * site DB. Idempotent; silent on failure.
 */
export async function syncContactUnsubscribe(email: string): Promise<void> {
  if (!enabled()) return
  try {
    await resend.contacts.update({
      audienceId: AUDIENCE_ID,
      email: email.trim().toLowerCase(),
      unsubscribed: true,
    })
  } catch (err) {
    console.error('[audience] unsubscribe sync failed', { email, err })
  }
}
