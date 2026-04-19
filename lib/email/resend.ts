import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.warn('[email] RESEND_API_KEY is not set. Email sending will fail.')
}

export const resend = new Resend(apiKey || 'missing')

export const SENDER_NAME = 'Tarek Alaaddin'
export const SENDER_EMAIL = process.env.RESEND_SENDER || 'newsletter@tarekalaaddin.com'
export const FROM = `${SENDER_NAME} <${SENDER_EMAIL}>`
export const REPLY_TO = process.env.RESEND_REPLY_TO || 'tarek@tarekalaaddin.com'

export function unsubscribeUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tarekalaaddin.com'
  return `${base}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}
