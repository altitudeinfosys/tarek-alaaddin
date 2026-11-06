'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@vercel/analytics'
import {
  POPUP_VISIBILITY_EVENT,
  SUBSCRIBED_EVENT,
  isSubscribed,
  markSubscribed,
} from '@/lib/newsletter-signup'

// Separate dismiss key from the popup so dismissing one doesn't hide the other.
const BAR_DISMISSED_KEY = 'newsletter-sticky-bar-dismissed'
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
const SHOW_AFTER_MS = 6_000 // small delay so it doesn't ambush on landing

type Status = 'hidden' | 'visible' | 'submitting' | 'success' | 'error'

/**
 * Slim always-visible signup bar on blog pages for non-subscribers. Lives below
 * the fold via `bottom-0 inset-x-0` with a 3-day dismiss flag separate from the
 * popup — so if someone kills the popup they still see this one.
 */
export default function StickyNewsletterBar() {
  const pathname = usePathname()
  const [status, setStatus] = useState<Status>('hidden')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    const onPopupVisibility = (event: Event) =>
      setPopupOpen((event as CustomEvent<{ visible: boolean }>).detail.visible)
    const hideIfOpen = () =>
      setStatus((current) => (current === 'visible' ? 'hidden' : current))

    window.addEventListener(POPUP_VISIBILITY_EVENT, onPopupVisibility)
    window.addEventListener(SUBSCRIBED_EVENT, hideIfOpen)
    return () => {
      window.removeEventListener(POPUP_VISIBILITY_EVENT, onPopupVisibility)
      window.removeEventListener(SUBSCRIBED_EVENT, hideIfOpen)
    }
  }, [])

  useEffect(() => {
    // Only on blog pages, excluding the index.
    if (!pathname?.startsWith('/blog/')) {
      setStatus('hidden')
      return
    }

    try {
      if (isSubscribed()) return
      const dismissedAt = localStorage.getItem(BAR_DISMISSED_KEY)
      if (dismissedAt) {
        const t = parseInt(dismissedAt, 10)
        if (Date.now() - t < DISMISS_DURATION_MS) return
      }
    } catch {
      return
    }

    const timer = setTimeout(() => {
      if (!isSubscribed()) setStatus('visible')
    }, SHOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [pathname])

  const dismiss = () => {
    setStatus('hidden')
    try {
      localStorage.setItem(BAR_DISMISSED_KEY, Date.now().toString())
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStatus('submitting')
    try {
      const response = await fetch('/api/newsletter/popup-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, honeypot, source: 'sticky-bar' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('success')
      markSubscribed()
      track('newsletter_stickybar_submit')
      setTimeout(() => setStatus('hidden'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('visible')
    }
  }

  if (status === 'hidden' || popupOpen) return null

  return (
    <div
      role="region"
      aria-label="Subscribe to the newsletter"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-300 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        {status === 'success' ? (
          <p className="flex-1 text-sm font-medium text-green-700 dark:text-green-400">
            You&apos;re in — check your inbox for a welcome note.
          </p>
        ) : (
          <>
            <p className="flex-1 min-w-0 text-sm text-gray-800 dark:text-gray-200">
              Get each new post on AI and building products by email.
            </p>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
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
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[14rem]"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-3.5 py-1.5 rounded-md bg-primary-600 dark:bg-primary-400 text-white dark:text-gray-950 text-sm font-semibold hover:bg-primary-700 dark:hover:bg-primary-300 transition disabled:opacity-50"
              >
                {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss newsletter bar"
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
        {error && (
          <p className="w-full text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}
