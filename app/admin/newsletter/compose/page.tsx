import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasViewKey } from '@/lib/admin-auth'
import { REPLY_TO } from '@/lib/email/resend'
import ComposeNewsletter from '@/components/newsletter/ComposeNewsletter'

export const metadata: Metadata = {
  title: 'Compose Email | Admin',
  description: 'Write and send a one-off email to newsletter subscribers',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { key?: string }
}

export default function ComposePage({ searchParams }: PageProps) {
  // The view key only opens the page and renders previews. Sending needs
  // CRON_SECRET, which is typed on the page and never put in a URL.
  if (!hasViewKey(searchParams.key)) {
    notFound()
  }
  const viewKey = searchParams.key as string

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compose email</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Write a one-off email to your subscribers ·{' '}
            <a
              href={`/admin/newsletter?key=${encodeURIComponent(viewKey)}`}
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Back to dashboard
            </a>
          </p>
        </div>
        <ComposeNewsletter viewKey={viewKey} defaultTestTo={REPLY_TO} />
      </div>
    </div>
  )
}
