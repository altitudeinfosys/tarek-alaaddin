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
}

export interface UpsertResult {
  subscriber: Subscriber
  isNew: boolean
  wasReactivated: boolean
}

export async function upsertSubscriber(input: UpsertSubscriberInput): Promise<UpsertResult> {
  const email = input.email.trim().toLowerCase()
  const existing = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1)

  if (existing[0]) {
    const row = existing[0]
    if (row.status === 'active') {
      return { subscriber: row, isNew: false, wasReactivated: false }
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
