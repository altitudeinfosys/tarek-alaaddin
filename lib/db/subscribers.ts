import { and, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from './index'
import { subscribers, sentTo, type Subscriber, type NewSubscriber } from './schema'

export interface UpsertSubscriberInput {
  email: string
  firstName?: string | null
  source: string
  interests?: {
    productivity?: boolean
    ai?: boolean
    marketing?: boolean
  }
  /**
   * Whether the calling path is allowed to clear a prior `unsubscribed`
   * status. Set true only on paths that pass a human-verification check
   * (e.g. Turnstile on /subscribe). Honeypot-only paths (popup/footer)
   * leave the default false so a bot can't silently reactivate an opted-out
   * address.
   *
   * Note: this is a bot-filter gate, NOT proof of mailbox ownership. A full
   * double opt-in flow (emailed confirmation link) would be the stronger
   * primitive — see docs/NEWSLETTER-RUNBOOK.md for the rationale on why
   * this personal-newsletter stack doesn't ship one today.
   *
   * `bounced` and `complained` rows are NEVER reactivated by this function,
   * regardless of allowReactivate — those are deliverability signals from
   * the ESP and only an operator-run SQL change should bring them back.
   *
   * Default false.
   */
  allowReactivate?: boolean
}

export interface UpsertResult {
  subscriber: Subscriber
  isNew: boolean
  wasReactivated: boolean
  /**
   * True when an existing non-active row was found and the caller wasn't
   * allowed to reactivate it. Callers can use this to show a friendly
   * "please confirm via /subscribe" message instead of a generic success.
   */
  reactivationBlocked?: boolean
}

export async function upsertSubscriber(input: UpsertSubscriberInput): Promise<UpsertResult> {
  const email = input.email.trim().toLowerCase()
  const existing = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1)

  if (existing[0]) {
    const row = existing[0]
    if (row.status === 'active') {
      return { subscriber: row, isNew: false, wasReactivated: false }
    }
    // 'bounced' and 'complained' are deliverability signals from Resend and
    // must NEVER be flipped to active from a public form — doing so damages
    // sender reputation and, for 'complained', risks anti-spam violations.
    // An operator can re-enable these manually with a direct SQL update if
    // they've verified the deliverability issue is resolved.
    if (row.status === 'bounced' || row.status === 'complained') {
      return { subscriber: row, isNew: false, wasReactivated: false, reactivationBlocked: true }
    }
    // Row is 'unsubscribed'. Only clear it if the caller passes
    // allowReactivate — unverified submits (honeypot-only popup/footer) must
    // not silently resubscribe someone who opted out.
    if (!input.allowReactivate) {
      return { subscriber: row, isNew: false, wasReactivated: false, reactivationBlocked: true }
    }
    const [updated] = await db
      .update(subscribers)
      .set({
        status: 'active',
        unsubscribedAt: null,
        firstName: input.firstName ?? row.firstName,
        interestProductivity: input.interests?.productivity ?? row.interestProductivity,
        interestAi: input.interests?.ai ?? row.interestAi,
        interestMarketing: input.interests?.marketing ?? row.interestMarketing,
      })
      .where(eq(subscribers.id, row.id))
      .returning()
    return { subscriber: updated, isNew: false, wasReactivated: true }
  }

  const insert: NewSubscriber = {
    email,
    firstName: input.firstName ?? null,
    source: input.source,
    unsubscribeToken: nanoid(32),
    interestProductivity: input.interests?.productivity ?? true,
    interestAi: input.interests?.ai ?? true,
    interestMarketing: input.interests?.marketing ?? true,
  }
  const [created] = await db.insert(subscribers).values(insert).returning()
  return { subscriber: created, isNew: true, wasReactivated: false }
}

export async function findByUnsubscribeToken(token: string): Promise<Subscriber | null> {
  const rows = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .limit(1)
  return rows[0] ?? null
}

export async function markUnsubscribed(token: string): Promise<Subscriber | null> {
  const [updated] = await db
    .update(subscribers)
    .set({ status: 'unsubscribed', unsubscribedAt: new Date() })
    .where(eq(subscribers.unsubscribeToken, token))
    .returning()
  return updated ?? null
}

export async function listActiveSubscribers(): Promise<Subscriber[]> {
  return db.select().from(subscribers).where(eq(subscribers.status, 'active'))
}

/**
 * Active subscribers who have NOT yet received the given send.
 * Used by the cron so a partial failure can resume without double-sending.
 */
export async function listPendingSubscribersForSend(sendId: string): Promise<Subscriber[]> {
  return db
    .select()
    .from(subscribers)
    .where(
      and(
        eq(subscribers.status, 'active'),
        sql`NOT EXISTS (SELECT 1 FROM ${sentTo} WHERE ${sentTo.subscriberId} = ${subscribers.id} AND ${sentTo.sendId} = ${sendId})`
      )
    )
}

export async function countByStatus(status: Subscriber['status']): Promise<number> {
  const rows = await db.select().from(subscribers).where(eq(subscribers.status, status))
  return rows.length
}
