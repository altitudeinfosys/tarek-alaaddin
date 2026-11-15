import { pgTable, text, timestamp, uuid, boolean, integer, uniqueIndex, primaryKey, date } from 'drizzle-orm/pg-core'

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

// Key/value switches the site reads at request time (today: the AI kill switch),
// so they can be flipped without a redeploy.
export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text('updated_by'),
})

// One row per (UTC day, feature): how many AI calls were let through, for the daily cap.
export const aiUsageDaily = pgTable('ai_usage_daily', {
  day: date('day').notNull(),
  feature: text('feature').notNull(),
  count: integer('count').notNull().default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.day, table.feature] }),
}))

export type Subscriber = typeof subscribers.$inferSelect
export type NewSubscriber = typeof subscribers.$inferInsert
export type Send = typeof sends.$inferSelect
export type NewSend = typeof sends.$inferInsert
