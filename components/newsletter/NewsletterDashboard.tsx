'use client'

import { useMemo } from 'react'
import NewsletterSubscribers from './NewsletterSubscribers'

interface Subscriber {
  id: string
  email: string
  first_name?: string
  subscribed_at: string
  confirmed_at?: string
  state: 'active' | 'unsubscribed' | 'bounced' | 'complained'
  tags?: string[]
}

interface RecentSend {
  id: string
  post_slug: string
  post_title: string
  sent_at: string
  recipient_count: number
}

interface Props {
  initialSubscribers: Subscriber[]
  recentSends?: RecentSend[]
}

function formatSentAt(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export default function NewsletterDashboard({ initialSubscribers, recentSends = [] }: Props) {
  const subscribers = initialSubscribers

  const stats = useMemo(() => {
    const total = subscribers.length
    const active = subscribers.filter((s) => s.state === 'active').length
    const inactive = total - active
    return { total, active, inactive }
  }, [subscribers])

  // Backfilled "mark-as-sent" rows have recipient_count=0 and shouldn't clutter the feed.
  const realSends = recentSends.filter((s) => s.recipient_count > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Subscribers</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Inactive</h3>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent sends</h2>
          <a
            href="https://resend.com/emails"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Open Resend Logs →
          </a>
        </div>
        {realSends.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No sends yet. The cron runs daily at 14:00 UTC and only emails posts dated on or after <code>NEWSLETTER_CUTOFF_DATE</code>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Post</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Sent</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Recipients</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Metrics</th>
                </tr>
              </thead>
              <tbody>
                {realSends.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-3">
                      <a
                        href={`/blog/${s.post_slug}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:underline"
                      >
                        {s.post_title}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">/{s.post_slug}</div>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatSentAt(s.sent_at)}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-900 dark:text-white text-right tabular-nums">
                      {s.recipient_count}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={`https://resend.com/emails?tag=slug%3A${encodeURIComponent(s.post_slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline whitespace-nowrap"
                      >
                        Open →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Subscribers</h2>
        <NewsletterSubscribers subscribers={subscribers} isLoading={false} />
      </div>
    </div>
  )
}
