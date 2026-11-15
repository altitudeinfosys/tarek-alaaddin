// Run with: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { APIConnectionError, APIConnectionTimeoutError, APIError, APIUserAbortError } from '@anthropic-ai/sdk'
import { wasNotBilled } from './ai-billing.ts'

test('connection errors and error statuses were not billed', () => {
  assert.equal(wasNotBilled(new APIConnectionError({ message: 'down' })), true)
  assert.equal(wasNotBilled(new APIConnectionTimeoutError()), true)
  for (const status of [400, 429, 500, 529]) {
    assert.equal(wasNotBilled(APIError.generate(status, { error: { type: 'x', message: 'x' } }, 'x', new Headers())), true, `status ${status}`)
  }
})

test('failures after a completed response were billed', () => {
  assert.equal(wasNotBilled(new Error('The model declined to answer this request')), false)
  assert.equal(wasNotBilled(new SyntaxError('Unexpected end of JSON input')), false)
  assert.equal(wasNotBilled(new APIUserAbortError()), false)
  assert.equal(wasNotBilled('nope'), false)
})
