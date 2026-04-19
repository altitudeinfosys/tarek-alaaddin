import { NextRequest, NextResponse } from 'next/server'
import { markUnsubscribed } from '@/lib/db/subscribers'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return renderHtml('Missing token', 'No unsubscribe token was provided.', false)
  }

  const result = await markUnsubscribed(token).catch((error) => {
    console.error('[unsubscribe] Error:', error)
    return null
  })

  if (!result) {
    return renderHtml(
      'Link expired',
      "We couldn't find that subscription. It may have already been cancelled.",
      false
    )
  }

  return renderHtml(
    'Unsubscribed',
    `You've been removed from the list. You won't receive any more emails from this newsletter.`,
    true
  )
}

function renderHtml(title: string, message: string, success: boolean) {
  const accent = success ? '#00d2ff' : '#f87171'
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  body { margin:0; background:#0a0a0a; color:#e5e5e5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
  .card { background:#111; border:1px solid #222; border-radius:8px; padding:40px; max-width:480px; text-align:center; }
  h1 { margin:0 0 12px; font-size:22px; color:${accent}; }
  p { margin:0 0 24px; color:#a3a3a3; line-height:1.6; }
  a { color:${accent}; text-decoration:none; font-weight:600; }
</style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://www.tarekalaaddin.com">← Back to site</a>
  </div>
</body>
</html>`
  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
