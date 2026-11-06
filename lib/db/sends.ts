import { desc, eq, gt } from 'drizzle-orm'
import { db } from './index'
import { sends, sentTo, type Send, type NewSend } from './schema'

export async function findSendByPostSlug(postSlug: string): Promise<Send | null> {
  const rows = await db.select().from(sends).where(eq(sends.postSlug, postSlug)).limit(1)
  return rows[0] ?? null
}

export async function recordSend(input: NewSend): Promise<Send> {
  const [row] = await db.insert(sends).values(input).returning()
  return row
}

export async function recordSentTo(subscriberId: string, sendId: string, resendEmailId: string | null) {
  await db.insert(sentTo).values({ subscriberId, sendId, resendEmailId }).onConflictDoNothing()
}

export async function updateSendRecipientCount(sendId: string, count: number) {
  await db.update(sends).set({ recipientCount: count }).where(eq(sends.id, sendId))
}

// Backfilled "mark as sent" rows have recipient_count = 0 and never went out.
export async function listRecentSends(limit = 20): Promise<Send[]> {
  return db
    .select()
    .from(sends)
    .where(gt(sends.recipientCount, 0))
    .orderBy(desc(sends.sentAt))
    .limit(limit)
}
