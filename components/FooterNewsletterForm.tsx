'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'

type Status = 'idle' | 'submitting' | 'success' | 'error'

// One-field signup in the footer. Uses the honeypot-protected popup endpoint
// so the footer form doesn't need Turnstile on every page.
export default function FooterNewsletterForm() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStatus('submitting')

    try {
      const response = await fetch('/api/newsletter/popup-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, honeypot, source: 'footer' }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      setStatus('success')
      track('newsletter_footer_submit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="mt-4 text-sm font-medium text-green-700 dark:text-green-400">
        You&apos;re in — check your inbox for a welcome note.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-2 max-w-md">
      {/* Honeypot — hidden from humans */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <input
        id="footer-newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        disabled={status === 'submitting'}
        className="flex-1 min-w-[12rem] px-3.5 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="px-4 py-2.5 rounded-md bg-primary-600 dark:bg-primary-400 text-white dark:text-gray-950 text-sm font-semibold hover:bg-primary-700 dark:hover:bg-primary-300 transition disabled:opacity-50"
      >
        {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {error && <p className="w-full text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  )
}
