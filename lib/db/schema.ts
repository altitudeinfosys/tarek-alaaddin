import { pgTable, text, timestamp, uuid, boolean, integer, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core'

export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  status: text('status', { enum: ['active', 'unsubscribed', 'bounced', 'complained'] })
    .notNull()
    .default('active'),
  source: text('source').notNull().default('unknown'),
  unsubscribeToken: text('unsubscribe_token').notNull(),
  interestProductivity: boolean('interest_productivity').notNull().default(true),
  interestAi: boolean('interest_ai').notNull().default(true),
  interestMarketing: boolean('interest_marketing').notNull().default(true),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
}, (table) => ({
  emailIdx: uniqueIndex('subscribers_email_idx').on(table.email),
  tokenIdx: uniqueIndex('subscribers_token_idx').on(table.unsubscribeToken),
}))

export const sends = pgTable('sends', {
  id: uuid('id').primaryKey().defaultRandom(),
  postSlug: text('post_slug').notNull(),
  postTitle: text('post_title').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  recipientCount: integer('recipient_count').notNull().default(0),
}, (table) => ({
  slugIdx: uniqueIndex('sends_post_slug_idx').on(table.postSlug),
}))

export const sentTo = pgTable('sent_to', {
  subscriberId: uuid('subscriber_id')
    .notNull()
    .references(() => subscribers.id, { onDelete: 'cascade' }),
  sendId: uuid('send_id')
    .notNull()
    .references(() => sends.id, { onDelete: 'cascade' }),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  resendEmailId: text('resend_email_id'),
}, (table) => ({
  pk: primaryKey({ columns: [table.subscriberId, table.sendId] }),
}))

export type Subscriber = typeof subscribers.$inferSelect
export type NewSubscriber = typeof subscribers.$inferInsert
export type Send = typeof sends.$inferSelect
export type NewSend = typeof sends.$inferInsert
