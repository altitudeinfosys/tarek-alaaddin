import { NextRequest, NextResponse } from 'next/server'
import { analyzeFitCheck } from '@/lib/claude'
import { getProfileForFitCheck } from '@/lib/resume-loader'

const MAX_JOB_DESCRIPTION_CHARS = 20000

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Rate limiting is enforced at the Vercel Firewall (5 POSTs / 10 min per IP), not here:
  // in-memory counters are not shared between function invocations on Vercel.
  try {
    const { jobDescription } = await request.json() as { jobDescription: string }

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

    const result = await analyzeFitCheck(getProfileForFitCheck(), jobDescription)

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
