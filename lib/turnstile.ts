/** Verifies a Cloudflare Turnstile token server-side. Tokens are single-use. */
export async function verifyTurnstile(token: unknown, remoteIp?: string | null): Promise<'ok' | 'failed' | 'not_configured'> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return 'not_configured'
  if (typeof token !== 'string' || !token) return 'failed'
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, ...(remoteIp ? { remoteip: remoteIp } : {}) }),
      signal: AbortSignal.timeout(8000),
    })
    const data = (await res.json().catch(() => ({}))) as { success?: boolean }
    return data.success ? 'ok' : 'failed'
  } catch (error) {
    console.error('[turnstile] verify failed:', error)
    return 'failed'
  }
}
