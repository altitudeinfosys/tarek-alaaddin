import { NextRequest } from 'next/server'
import { streamChat, ChatMessage } from '@/lib/claude'
import { getResumeForChat } from '@/lib/resume-loader'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json() as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages required', { status: 400 })
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

    // Stream the response
    const stream = await streamChat(messages, systemPrompt, 'haiku')

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
