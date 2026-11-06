'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SUBSCRIBED_KEY = 'newsletter-popup-subscribed'

/**
 * Mid-article CTA block that authors (or the content pipeline) can drop into an
 * MDX post with <InlineNewsletterCTA />. Hidden for known subscribers so loyal
 * readers aren't hassled.
 */
export default function InlineNewsletterCTA() {
  const [isSubscriber, setIsSubscriber] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setIsSubscriber(localStorage.getItem(SUBSCRIBED_KEY) === 'true')
    } catch {
      setIsSubscriber(false)
    }
  }, [])

  if (isSubscriber) return null

  return (
    <aside className="not-prose my-10 rounded-lg border-l-4 border-primary-500 bg-gray-50 dark:bg-gray-900/60 p-5">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        Enjoying this?
      </p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        I write a weekly post on AI engineering and shipping real products.
        No fluff.
      </p>
      <Link
        href="/subscribe"
        className="mt-3 inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
      >
        Subscribe →
      </Link>
    </aside>
  )
}
