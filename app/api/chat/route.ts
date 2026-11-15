import { NextRequest, NextResponse } from 'next/server'
import { chat, ChatMessage } from '@/lib/claude'
import { getResumeForChat } from '@/lib/resume-loader'
import { gateAiCall, refundAiCall, AI_UNAVAILABLE_MESSAGE } from '@/lib/ai-guard'

export const runtime = 'nodejs'

const MAX_MESSAGES = 40
// Visitor turns are typed questions; assistant turns are the model's earlier replies.
const MAX_CHARS = { user: 4000, assistant: 12000 } as const

export async function POST(request: NextRequest) {
  // Rate limiting is enforced at the Vercel Firewall (20 POSTs / 10 min per IP)
  try {
    const { messages } = await request.json() as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request: messages required' }, { status: 400 })
    }

    // Bound what one request can spend: a short conversation of plain-text turns.
    const wellFormed = messages.every(
      (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length <= MAX_CHARS[m.role]
    )
    if (!wellFormed || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: 'Invalid request: messages required' }, { status: 400 })
    }

    // Kill switch and daily cap (lib/ai-guard.ts); each message counts once.
    const gate = await gateAiCall('chat')
    if (!gate.ok) {
      return NextResponse.json({ error: AI_UNAVAILABLE_MESSAGE[gate.reason], unavailable: gate.reason }, { status: 503 })
    }

    // Load resume data for context
    const resumeContext = getResumeForChat()

    // Build system prompt
    const systemPrompt = `You are an AI assistant on Tarek Alaaddin's resume website. Your job is to answer questions about Tarek's experience, skills, background, and career in a helpful and personable way.

Key guidelines:
- Be conversational and friendly, but professional
- Answer based on the resume data provided below
- If asked about something not in the resume, say you don't have that information
- Share context about decisions, motivations, and experiences when relevant
- Keep responses concise but informative (2-4 paragraphs max)
- Be honest about strengths and areas of growth
- If asked about salary, say Tarek prefers to discuss compensation directly

Here is Tarek's resume and additional context:

${resumeContext}

Remember: You're representing Tarek, so be authentic and helpful. Don't make up information that isn't in the resume or context.`

    // Get non-streaming response
    let response: string
    try {
      response = await chat(messages, systemPrompt, 'haiku')
    } catch (error) {
      await refundAiCall('chat', error)
      throw error
    }

    return NextResponse.json({ content: response })
  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)

    // Return more specific error for debugging
    if (errorMessage.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
