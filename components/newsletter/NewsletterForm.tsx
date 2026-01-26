'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Turnstile from '@/components/Turnstile'
import TopicSelector from './TopicSelector'
import Button from '@/components/ui/Button'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

export default function NewsletterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
  })
  const [topics, setTopics] = useState({
    productivity: true,
    ai: false,
    marketing: false,
  })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate at least one topic is selected
    if (!topics.productivity && !topics.ai && !topics.marketing) {
      setStatus('error')
      setErrorMessage('Please select at least one topic')
      return
    }

    // Only require Turnstile token if Turnstile is enabled
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus('error')
      setErrorMessage('Please complete the verification')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          topics,
          turnstileToken,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      // Redirect to thank you page on success
      router.push('/thank-you')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          placeholder="you@example.com"
        />
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          First Name (Optional)
        </label>
        <input
          type="text"
          id="firstName"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          placeholder="John"
        />
      </div>

      {/* Topic Selector */}
      <TopicSelector selectedTopics={topics} onChange={setTopics} />

      {/* Error Message */}
      {status === 'error' && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300"
        >
          {errorMessage}
        </div>
      )}

      {/* Cloudflare Turnstile */}
      {TURNSTILE_SITE_KEY && (
        <Turnstile
          siteKey={TURNSTILE_SITE_KEY}
          onVerify={(token) => setTurnstileToken(token)}
          onError={() => setTurnstileToken(null)}
        />
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={status === 'loading'}
        fullWidth
        size="lg"
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center">
            Subscribing...
            <svg className="ml-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        ) : (
          'Get the Free Guide'
        )}
      </Button>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        By subscribing, you agree to receive emails from me. You can unsubscribe at any time.
      </p>
    </form>
  )
}
