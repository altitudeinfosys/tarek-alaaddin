import { Metadata } from 'next'
import NewsletterDashboard from '@/components/newsletter/NewsletterDashboard'

export const metadata: Metadata = {
  title: 'Newsletter Dashboard | Admin',
  description: 'Manage newsletter subscribers',
}

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Newsletter Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and monitor your newsletter subscribers
          </p>
        </div>

        {/* Dashboard */}
        <NewsletterDashboard />
      </div>
    </div>
  )
}
