'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import {
  POPUP_VISIBILITY_EVENT,
  SUBSCRIBED_EVENT,
  isSubscribed,
  markSubscribed,
} from '@/lib/newsletter-signup'

const DISMISSED_KEY = 'newsletter-popup-dismissed'
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000 // 3 days (was 7)
const SCROLL_THRESHOLD = 0.25 // fire earlier (was 0.5)
const TIME_FALLBACK_MS = 45_000 // show after 45s regardless of scroll
const EXIT_INTENT_MIN_MS = 10_000 // don't exit-intent-trigger instantly on load
// Homepage has its own footer signup; don't stack the popup on top of it.
const EXCLUDED_PATHS = ['/', '/subscribe', '/thank-you']

type PopupState = 'hidden' | 'visible' | 'submitting' | 'success'

export default function NewsletterPopup() {
  const [state, setState] = useState<PopupState>('hidden')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const pathname = usePathname()

  const shouldShow = useCallback(() => {
    if (EXCLUDED_PATHS.includes(pathname)) return false

    try {
      if (isSubscribed()) return false

      const dismissed = localStorage.getItem(DISMISSED_KEY)
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10)
        if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return false
      }
    } catch {
      // localStorage unavailable
      return false
    }

    return true
  }, [pathname])

  useEffect(() => {
    if (!shouldShow()) return

    const loadedAt = Date.now()
    let fired = false
    const fire = () => {
      if (fired) return
      fired = true
      if (!isSubscribed()) setState('visible')
      window.removeEventListener('scroll', handleScroll)
      // Must match the addEventListener target — this listener is on document.
      document.removeEventListener('mouseout', handleMouseOut)
      clearTimeout(timeFallback)
    }

    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollableHeight <= 0) return
      const scrollPercent = window.scrollY / scrollableHeight
      if (scrollPercent >= SCROLL_THRESHOLD) fire()
    }

    // Exit intent: pointer leaves the top of the viewport. Desktop-ish only — on
    // touch there's no equivalent and this never fires, which is fine.
    const handleMouseOut = (event: MouseEvent) => {
      if (event.relatedTarget) return // moving to another element, not leaving
      if (event.clientY > 0) return // only when leaving via the top edge
      if (Date.now() - loadedAt < EXIT_INTENT_MIN_MS) return
      fire()
    }

    const timeFallback = setTimeout(fire, TIME_FALLBACK_MS)
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mouseout', handleMouseOut)
      clearTimeout(timeFallback)
    }
  }, [shouldShow])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(POPUP_VISIBILITY_EVENT, { detail: { visible: state !== 'hidden' } })
    )
  }, [state])

  useEffect(() => {
    const closeIfOpen = () =>
      setState((current) => (current === 'visible' ? 'hidden' : current))
    window.addEventListener(SUBSCRIBED_EVENT, closeIfOpen)
    return () => window.removeEventListener(SUBSCRIBED_EVENT, closeIfOpen)
  }, [])

  const dismiss = () => {
    setState('hidden')
    try {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    } catch {
      // localStorage unavailable
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setState('submitting')

    try {
      const response = await fetch('/api/newsletter/popup-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, honeypot }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        setState('visible')
        return
      }

      setState('success')
      markSubscribed()

      setTimeout(() => setState('hidden'), 2000)
    } catch {
      setError('Network error. Please try again.')
      setState('visible')
    }
  }

  if (state === 'hidden') return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] sm:w-96 animate-slide-up">
      <div className="rounded-lg bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700 p-5">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close newsletter popup"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {state === 'success' ? (
          <div className="text-center py-2">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30 mb-3">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">You&apos;re subscribed!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Check your inbox for a welcome email.</p>
          </div>
        ) : (
          <>
            <div className="mb-3 pr-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Stay in the loop
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Get each new post on AI and building products by email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Honeypot field - hidden from real users */}
              <input
                type="text"
                name="company_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                aria-hidden="true"
              />

              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="field px-3 py-2 text-sm"
              />

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field px-3 py-2 text-sm"
              />

              {error && (
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={state === 'submitting'}
                className="btn-flat btn-flat-primary w-full text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === 'submitting' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>

              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
