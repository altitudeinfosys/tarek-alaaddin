'use client'

import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'

const SUBSCRIBED_KEY = 'newsletter-popup-subscribed'

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * End-of-post signup card. Renders unconditionally below every blog post,
 * except for visitors who already subscribed (we check the shared
 * localStorage flag used by the popup/footer).
 */
export default function EndOfPostNewsletterCard() {
  const [isSubscriber, setIsSubscriber] = useState<boolean | null>(null)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      setIsSubscriber(localStorage.getItem(SUBSCRIBED_KEY) === 'true')
    } catch {
      setIsSubscriber(false)
    }
  }, [])

  if (isSubscriber) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStatus('submitting')
    try {
      const response = await fetch('/api/newsletter/popup-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, honeypot, source: 'popup' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('success')
      try {
        localStorage.setItem(SUBSCRIBED_KEY, 'true')
      } catch {}
      track('newsletter_endofpost_submit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <section
      aria-labelledby="endofpost-newsletter-heading"
      className="mt-12 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-8"
    >
      {status === 'success' ? (
        <div className="text-center py-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">You&apos;re in.</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Check your inbox for a welcome note.
          </p>
        </div>
      ) : (
        <>
          <div className="max-w-xl">
            <h3
              id="endofpost-newsletter-heading"
              className="text-xl md:text-2xl font-display font-bold tracking-[-0.02em] text-gray-900 dark:text-white"
            >
              Get posts like this in your inbox.
            </h3>
            <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
              Weekly notes on AI engineering, automation, and building products — no fluff, unsubscribe anytime.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
            {/* Honeypot */}
            <input
              type="text"
              name="company"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-label="First name"
              className="px-3.5 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              className="px-3.5 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="px-5 py-2.5 rounded-md bg-primary-600 dark:bg-primary-400 text-white dark:text-gray-950 text-sm font-semibold hover:bg-primary-700 dark:hover:bg-primary-300 transition disabled:opacity-50"
            >
              {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
            </button>
            {error && <p className="col-span-full text-xs text-red-600 dark:text-red-400">{error}</p>}
          </form>
          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-500">
            No spam. One email per post. Unsubscribe anytime.
          </p>
        </>
      )}
    </section>
  )
}
