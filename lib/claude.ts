import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export type ModelType = 'haiku' | 'sonnet'

const MODELS: Record<ModelType, string> = {
  haiku: 'claude-3-5-haiku-latest',
  sonnet: 'claude-3-5-sonnet-latest',
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function chat(
  messages: ChatMessage[],
  systemPrompt: string,
  model: ModelType = 'haiku'
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODELS[model],
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : ''
}

export async function streamChat(
  messages: ChatMessage[],
  systemPrompt: string,
  model: ModelType = 'haiku'
): Promise<ReadableStream<Uint8Array>> {
  const stream = await anthropic.messages.stream({
    model: MODELS[model],
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })
}

export async function analyzeFitCheck(
  resumeMarkdown: string,
  jobDescription: string
): Promise<{
  score: number
  strengths: string[]
  gaps: string[]
  assessment: string
}> {
  const systemPrompt = `You are an expert recruiter analyzing job fit. Be honest and direct.

Analyze the job description against the candidate's resume and provide:
1. A match score from 0-100
2. Strong matches - specific skills/experience that align well (with evidence from resume)
3. Gaps - requirements the candidate doesn't fully meet
4. Honest assessment - is this a good fit? Be direct about the reality.

Respond in JSON format:
{
  "score": number,
  "strengths": ["strength 1 with evidence", "strength 2 with evidence"],
  "gaps": ["gap 1", "gap 2"],
  "assessment": "2-3 sentence honest take on the fit"
}`

  const userMessage = `Resume:
${resumeMarkdown}

Job Description:
${jobDescription}`

  const response = await anthropic.messages.create({
    model: MODELS.sonnet,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  const text = textBlock?.type === 'text' ? textBlock.text : '{}'

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse fit check response')
  }

  return JSON.parse(jsonMatch[0])
}
