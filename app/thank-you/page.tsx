import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thank You for Subscribing | Tarek Alaaddin',
  description: 'Thanks for subscribing to my newsletter. Check your inbox for your free productivity guide!',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ThankYouPage() {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
          You're In! 🎉
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Thanks for subscribing to my newsletter!
        </p>

        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-6 mb-12">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            What Happens Next?
          </h2>
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Check your inbox</strong> for a confirmation email with your free guide
              </span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Whitelist my email</strong> to ensure you receive all updates
              </span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Get ready</strong> for practical tips on productivity, AI tools, and product development
              </span>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            While you're here, check out what else I'm working on:
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/products">
              <Button size="lg">
                Explore My Products
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" size="lg">
                Read the Blog
              </Button>
            </Link>
          </div>
        </div>

        {/* Back Home */}
        <div className="mt-12">
          <Link href="/" className="text-primary-600 dark:text-primary-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
