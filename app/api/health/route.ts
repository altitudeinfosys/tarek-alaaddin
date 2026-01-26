import { NextResponse } from 'next/server'

/**
 * Health check endpoint to verify API configuration
 * Useful for debugging environment variable issues in production
 */
export async function GET() {
  const config = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configured: {
      kitApi: !!process.env.KIT_API_KEY,
      kitApiLength: process.env.KIT_API_KEY?.length || 0,
      kitBaseUrl: !!process.env.KIT_API_BASE_URL,
      turnstileSecret: !!process.env.TURNSTILE_SECRET_KEY,
      turnstileSiteKey: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    },
    values: {
      kitBaseUrl: process.env.KIT_API_BASE_URL || 'https://api.kit.com/v4 (default)',
    },
  }

  return NextResponse.json(config)
}
