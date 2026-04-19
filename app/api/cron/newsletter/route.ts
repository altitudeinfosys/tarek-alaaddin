import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, getPostBySlug } from '@/lib/mdx'
import { listActiveSubscribers, listPendingSubscribersForSend } from '@/lib/db/subscribers'
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

  let cutoff: Date
  try {
    cutoff = parseCutoff(process.env.NEWSLETTER_CUTOFF_DATE)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid cutoff'
    console.error('[cron/newsletter]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

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
  const slug = typeof body.slug === 'string' ? body.slug : undefined
  const dryRun = !!body.dryRun

  let cutoff: Date
  try {
    cutoff = parseCutoff(body.cutoff || process.env.NEWSLETTER_CUTOFF_DATE)
  } catch (error) {
    // When force-sending a single slug, the cutoff doesn't apply — let it through.
    if (!slug) {
      const message = error instanceof Error ? error.message : 'Invalid cutoff'
      console.error('[cron/newsletter]', message)
      return NextResponse.json({ error: message }, { status: 500 })
    }
    cutoff = new Date(0)
  }

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

    if (dryRun) {
      const activeSubs = await listActiveSubscribers()
      summary.push({ slug: meta.slug, status: 'dry-run', recipients: activeSubs.length })
      continue
    }

    const send = existing ?? (await recordSend({
      postSlug: meta.slug,
      postTitle: meta.title,
      recipientCount: 0,
    }))

    // Idempotency: only email subscribers who have NOT already received THIS send.
    // If a previous run partially completed, this excludes the ones already emailed.
    const pending = await listPendingSubscribersForSend(send.id)
    if (pending.length === 0) {
      summary.push({ slug: meta.slug, status: 'already-sent-to-all', recipients: send.recipientCount })
      continue
    }

    const postUrl = `${SITE_URL}/blog/${meta.slug}`
    let successCount = send.recipientCount
    const errors: string[] = []

    for (let i = 0; i < pending.length; i += 100) {
      const batch = pending.slice(i, i + 100)
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
    throw new Error('NEWSLETTER_CUTOFF_DATE is not set — refusing to run. Set it to an ISO date in env (e.g. 2026-04-18) to opt in to sending.')
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`NEWSLETTER_CUTOFF_DATE is not a valid date: "${raw}"`)
  }
  return parsed
}
