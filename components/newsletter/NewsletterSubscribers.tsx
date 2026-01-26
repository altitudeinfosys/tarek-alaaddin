'use client'

import { useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'

interface Subscriber {
  id: string
  email: string
  first_name?: string
  subscribed_at: string
  confirmed_at?: string
  state: 'active' | 'inactive' | 'bounced' | 'complained' | 'cancelled'
  tags?: string[]
}

interface NewsletterSubscribersProps {
  subscribers: Subscriber[]
  isLoading?: boolean
}

/**
 * Safe date formatter that handles invalid dates
 */
function formatDate(dateString: string | undefined | null, formatStr: string = 'PPp'): string {
  if (!dateString) return '-'

  try {
    const date = parseISO(dateString)
    if (!isValid(date)) {
      return '-'
    }
    return format(date, formatStr)
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', dateString)
    return '-'
  }
}

export default function NewsletterSubscribers({ subscribers, isLoading }: NewsletterSubscribersProps) {
  const [filter, setFilter] = useState<string>('all')

  const filteredSubscribers = subscribers.filter((sub) => {
    if (filter === 'all') return true
    return sub.state === filter
  })

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subscribers...</p>
      </div>
    )
  }

  if (subscribers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No subscribers yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          All ({subscribers.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Active ({subscribers.filter(s => s.state === 'active').length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'inactive'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Inactive ({subscribers.filter(s => s.state === 'inactive').length})
        </button>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                Email
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                Name
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                Subscribed
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                Confirmed
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                Tags
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.map((sub) => (
              <tr
                key={sub.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {sub.email}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {sub.first_name || '-'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      sub.state === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : sub.state === 'inactive'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {sub.state}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(sub.subscribed_at)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(sub.confirmed_at)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {sub.tags && sub.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {sub.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex px-2 py-0.5 text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {sub.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{sub.tags.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSubscribers.length === 0 && (
        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
          No subscribers match the current filter.
        </div>
      )}
    </div>
  )
}
