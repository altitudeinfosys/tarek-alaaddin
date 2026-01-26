import { Metadata } from 'next'
import NewsletterForm from '@/components/newsletter/NewsletterForm'

export const metadata: Metadata = {
  title: 'Subscribe | Tarek Alaaddin',
  description: 'Get my free guide on becoming innovative and productive. Learn productivity tips, AI tools, and strategies I use to build products.',
  openGraph: {
    title: 'Subscribe to Newsletter | Tarek Alaaddin',
    description: 'Get my free guide on becoming innovative and productive.',
    url: 'https://tarekalaaddin.com/subscribe',
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
}

export default function SubscribePage() {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-sm font-medium text-primary-700 dark:text-primary-300 mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Free Guide
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            How to Become Innovative and Productive
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Get my comprehensive guide packed with productivity tips, AI tools, and strategies
            I use to build products like Taskitos and ExpandNote.
          </p>

          {/* What You'll Get */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-12 text-left">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              What You'll Get:
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Productivity Stack Guide:</strong> My complete system for staying productive and never missing what matters
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>AI Tools I Use Daily:</strong> Practical AI integrations for developers and product builders
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Exclusive Tips:</strong> Occasional insights on software engineering, product development, and building SaaS
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-700">
          <NewsletterForm />
        </div>

        {/* Trust Signals */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Join the newsletter. No spam. Unsubscribe anytime.</p>
          <p className="mt-2">I respect your privacy and will never share your email.</p>
        </div>
      </div>
    </div>
  )
}
