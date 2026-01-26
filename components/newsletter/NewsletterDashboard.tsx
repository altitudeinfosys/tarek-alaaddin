'use client'

import { useState, useEffect } from 'react'
import NewsletterSubscribers from './NewsletterSubscribers'

interface DashboardStats {
  total: number
  active: number
  inactive: number
  growth: number
}

interface Subscriber {
  id: string
  email: string
  first_name?: string
  subscribed_at: string
  confirmed_at?: string
  state: 'active' | 'inactive' | 'bounced' | 'complained' | 'cancelled'
  tags?: string[]
}

export default function NewsletterDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    inactive: 0,
    growth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  async function fetchSubscribers() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/newsletter/subscribers')

      if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.status}`)
      }

      const data = await response.json()

      setSubscribers(data.subscribers || [])

      // Calculate stats
      const total = data.subscribers?.length || 0
      const active = data.subscribers?.filter((s: Subscriber) => s.state === 'active').length || 0
      const inactive = total - active

      setStats({
        total,
        active,
        inactive,
        growth: 0, // TODO: Calculate based on time period
      })
    } catch (err) {
      console.error('Error fetching subscribers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscribers')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={fetchSubscribers}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Total Subscribers
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Active
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.active}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Inactive
          </h3>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
            {stats.inactive}
          </p>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Subscribers
        </h2>
        <NewsletterSubscribers subscribers={subscribers} isLoading={isLoading} />
      </div>
    </div>
  )
}
