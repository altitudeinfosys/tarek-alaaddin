import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, getPostBySlug } from '@/lib/mdx'
import { listActiveSubscribers } from '@/lib/db/subscribers'
import { findSendByPostSlug, recordSend, recordSentTo, updateSendRecipientCount } from '@/lib/db/sends'
import { resend, FROM, REPLY_TO } from '@/lib/email/resend'
import { renderBlogPostEmail } from '@/lib/email/templates'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tarekalaaddin.com'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = parseCutoff(process.env.NEWSLETTER_CUTOFF_DATE)
  const result = await runNewsletterSend({ cutoff, dryRun: false })
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const cutoff = parseCutoff(body.cutoff || process.env.NEWSLETTER_CUTOFF_DATE)
  const dryRun = !!body.dryRun
  const slug = typeof body.slug === 'string' ? body.slug : undefined

  const result = await runNewsletterSend({ cutoff, dryRun, forceSlug: slug })
  return NextResponse.json(result)
}

interface RunArgs {
  cutoff: Date
  dryRun: boolean
  forceSlug?: string
}

async function runNewsletterSend({ cutoff, dryRun, forceSlug }: RunArgs) {
  const posts = getAllPosts()
  const candidates = forceSlug
    ? posts.filter((p) => p.slug === forceSlug)
    : posts.filter((p) => new Date(p.date) >= cutoff)

  const summary: Array<{ slug: string; status: string; recipients?: number; error?: string }> = []

  for (const meta of candidates) {
    const existing = await findSendByPostSlug(meta.slug)
    if (existing && !forceSlug) {
      summary.push({ slug: meta.slug, status: 'already-sent', recipients: existing.recipientCount })
      continue
    }

    const post = getPostBySlug(meta.slug)
    if (!post || !post.published) {
      summary.push({ slug: meta.slug, status: 'skipped-unpublished' })
      continue
    }

    const subscribers = await listActiveSubscribers()
    if (subscribers.length === 0) {
      summary.push({ slug: meta.slug, status: 'no-subscribers' })
      if (!dryRun && !existing) {
        await recordSend({
          postSlug: meta.slug,
          postTitle: meta.title,
          recipientCount: 0,
        })
      }
      continue
    }

    if (dryRun) {
      summary.push({ slug: meta.slug, status: 'dry-run', recipients: subscribers.length })
      continue
    }

    const send = existing ?? (await recordSend({
      postSlug: meta.slug,
      postTitle: meta.title,
      recipientCount: 0,
    }))

    const postUrl = `${SITE_URL}/blog/${meta.slug}`
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < subscribers.length; i += 100) {
      const batch = subscribers.slice(i, i + 100)
      const batchPayload = batch.map((sub) => {
        const { subject, html, text } = renderBlogPostEmail({
          postTitle: meta.title,
          postDescription: meta.description,
          postUrl,
          unsubscribeToken: sub.unsubscribeToken,
          firstName: sub.firstName,
        })
        return {
          from: FROM,
          to: sub.email,
          replyTo: REPLY_TO,
          subject,
          html,
          text,
        }
      })

      try {
        const batchResponse = await resend.batch.send(batchPayload)
        const sent = batchResponse.data?.data ?? []
        for (let j = 0; j < batch.length; j++) {
          const sub = batch[j]
          const emailResult = sent[j]
          await recordSentTo(sub.id, send.id, emailResult?.id ?? null)
          successCount++
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        errors.push(msg)
        console.error(`[cron/newsletter] batch failed for ${meta.slug}:`, msg)
      }
    }

    await updateSendRecipientCount(send.id, successCount)
    summary.push({
      slug: meta.slug,
      status: errors.length ? 'partial' : 'sent',
      recipients: successCount,
      error: errors.join('; ') || undefined,
    })
  }

  return {
    timestamp: new Date().toISOString(),
    cutoff: cutoff.toISOString(),
    dryRun,
    processed: summary.length,
    results: summary,
  }
}

function parseCutoff(raw: string | undefined): Date {
  if (!raw) {
    return new Date()
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return new Date()
  }
  return parsed
}
