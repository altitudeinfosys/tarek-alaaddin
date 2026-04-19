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

interface Props {
  initialSubscribers: Subscriber[]
}

export default function NewsletterDashboard({ initialSubscribers }: Props) {
  const subscribers = initialSubscribers

  const stats = useMemo(() => {
    const total = subscribers.length
    const active = subscribers.filter((s) => s.state === 'active').length
    const inactive = total - active
    return { total, active, inactive }
  }, [subscribers])

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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Subscribers</h2>
        <NewsletterSubscribers subscribers={subscribers} isLoading={false} />
      </div>
    </div>
  )
}
