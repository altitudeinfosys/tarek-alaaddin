import { NextRequest, NextResponse } from 'next/server'
import { ipAddress } from '@vercel/functions'
import { analyzeFitCheck } from '@/lib/claude'
import { getProfileForFitCheck } from '@/lib/resume-loader'
import { gateAiCall, refundAiCall, AI_UNAVAILABLE_MESSAGE } from '@/lib/ai-guard'
import { verifyTurnstile } from '@/lib/turnstile'
import { notifyTarek, parseVisitorContact, jobHint, DISABLE_AI_ACTION } from '@/lib/notify/ackpush'

const MAX_JOB_DESCRIPTION_CHARS = 20000

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Abuse controls, in order: Vercel Firewall rate limit (5 POSTs / 10 min per
  // IP, configured in the dashboard), Turnstile, the AI kill switch, and a
  // daily cap (lib/ai-guard.ts).
  try {
    const body = await request.json().catch(() => null) as {
      jobDescription?: unknown
      turnstileToken?: unknown
      name?: unknown
      email?: unknown
    } | null
    const jobDescription = body?.jobDescription

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    if (jobDescription.length < 50) {
      return NextResponse.json(
        { error: 'Job description is too short. Please paste the full job description.' },
        { status: 400 }
      )
    }

    if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
      return NextResponse.json(
        { error: 'Job description is too long. Please paste only the role description.' },
        { status: 400 }
      )
    }

    const contact = parseVisitorContact(body?.name, body?.email)
    if (!contact.ok) {
      return NextResponse.json({ error: contact.error }, { status: 400 })
    }

    const turnstile = await verifyTurnstile(body?.turnstileToken, ipAddress(request))
    if (turnstile === 'not_configured') {
      console.error('[fit-check] TURNSTILE_SECRET_KEY is not configured')
      return NextResponse.json({ error: 'Failed to analyze job fit' }, { status: 500 })
    }
    if (turnstile === 'failed') {
      return NextResponse.json(
        { error: 'Verification failed. Please complete the check and try again.' },
        { status: 400 }
      )
    }

    const gate = await gateAiCall('fit_check')
    if (!gate.ok) {
      return NextResponse.json({ error: AI_UNAVAILABLE_MESSAGE[gate.reason], unavailable: gate.reason }, { status: 503 })
    }

    let result: Awaited<ReturnType<typeof analyzeFitCheck>>
    try {
      result = await analyzeFitCheck(getProfileForFitCheck(), jobDescription)
    } catch (error) {
      await refundAiCall('fit_check', error)
      throw error
    }

    const who = [contact.contact.name, contact.contact.email].filter(Boolean).join(' · ') || 'Anonymous visitor'
    notifyTarek({
      title: `Fit check: ${result.score}% (${result.verdict})`,
      body: `${who}\nRole: ${jobHint(jobDescription)}\n\n${result.assessment}`,
      thread_key: 'fit-checks',
      actions: [DISABLE_AI_ACTION],
      metadata: { kind: 'fit_check', score: result.score },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Fit check API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)

    // Details stay in the server logs; visitors get a generic message
    return NextResponse.json(
      { error: 'Failed to analyze job fit' },
      { status: 500 }
    )
  }
}
