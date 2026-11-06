import fs from 'node:fs'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (!expected || request.nextUrl.searchParams.get('key') !== expected) {
    return new NextResponse('Not found', { status: 404 })
  }

  const html = fs.readFileSync(
    path.join(process.cwd(), 'docs/newsletter/operator-guide.html'),
    'utf8'
  )
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
