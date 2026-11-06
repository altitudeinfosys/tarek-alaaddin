import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { desc } from 'drizzle-orm'
import { db, subscribers } from '@/lib/db'
import { listRecentSends } from '@/lib/db/sends'
import NewsletterDashboard from '@/components/newsletter/NewsletterDashboard'

export const metadata: Metadata = {
  title: 'Newsletter Dashboard | Admin',
  description: 'Manage newsletter subscribers',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { key?: string }
}

export default async function NewsletterPage({ searchParams }: PageProps) {
  // A separate key from CRON_SECRET: this one travels in URLs, so it must not be
  // able to trigger sends.
  const expected = process.env.ADMIN_VIEW_KEY
  if (!expected || searchParams.key !== expected) {
    notFound()
  }

  const [rows, sends] = await Promise.all([
    db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt)),
    listRecentSends(20),
  ])

  const initialSubscribers = rows.map((sub) => ({
    id: sub.id,
    email: sub.email,
    first_name: sub.firstName ?? undefined,
    subscribed_at: sub.subscribedAt.toISOString(),
    state: sub.status,
  }))

  const recentSends = sends.map((s) => ({
    id: s.id,
    post_slug: s.postSlug,
    post_title: s.postTitle,
    sent_at: s.sentAt.toISOString(),
    recipient_count: s.recipientCount,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Newsletter Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and monitor your newsletter subscribers ·{' '}
            <a
              href={`/admin/newsletter/guide?key=${encodeURIComponent(expected)}`}
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Operator guide
            </a>
          </p>
        </div>
        <NewsletterDashboard
          initialSubscribers={initialSubscribers}
          recentSends={recentSends}
        />
      </div>
    </div>
  )
}
