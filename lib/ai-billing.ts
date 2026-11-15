// Decides whether a failed Claude call was billed. Pure, so it runs under `npm test`.
import { APIError, APIUserAbortError } from '@anthropic-ai/sdk'

/**
 * True when the call failed before Anthropic returned a message: a connection
 * error, a timeout, or an error status (4xx, 5xx, 529 overloaded). None of those
 * are billed, so the cap slot can be given back.
 *
 * False for everything else. A refusal, a reply cut off at max_tokens, or a reply
 * that doesn't parse all arrive as a normal, billed response and then throw in
 * our code, so they keep counting against the daily cap.
 */
export function wasNotBilled(error: unknown): boolean {
  return error instanceof APIError && !(error instanceof APIUserAbortError)
}
