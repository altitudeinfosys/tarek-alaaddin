'use client'

import { useEffect, useRef, useCallback } from 'react'

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

export default function Turnstile({ siteKey, onVerify, onError, theme = 'auto' }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const renderedRef = useRef(false)

  // Store callbacks in refs to avoid re-render issues
  const onVerifyRef = useRef(onVerify)
  const onErrorRef = useRef(onError)

  // Update refs when callbacks change
  onVerifyRef.current = onVerify
  onErrorRef.current = onError

  const handleVerify = useCallback((token: string) => {
    onVerifyRef.current(token)
  }, [])

  const handleError = useCallback(() => {
    onErrorRef.current?.()
  }, [])

  useEffect(() => {
    // Prevent double rendering in strict mode
    if (renderedRef.current) return

    const renderWidget = () => {
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        renderedRef.current = true
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: handleVerify,
          'error-callback': handleError,
          theme,
        })
      }
    }

    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget()
    } else {
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="turnstile"]')
      if (existingScript) {
        existingScript.addEventListener('load', renderWidget)
        return
      }

      // Load the Turnstile script
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.onload = renderWidget
      document.head.appendChild(script)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          // Widget may already be removed
        }
        widgetIdRef.current = null
        renderedRef.current = false
      }
    }
  }, [siteKey, theme, handleVerify, handleError])

  return <div ref={containerRef} className="mt-4" />
}
