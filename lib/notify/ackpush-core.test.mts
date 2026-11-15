// Run with: npm test  (node:test, Node strips the TypeScript types)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { verifyAckPushSignature, switchActionFrom, parseVisitorContact, fitMessage, jobHint } from './ackpush-core.ts'

const SECRET = 'whsec_test'
const sign = (t: number, body: string, secret = SECRET) =>
  `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`

test('accepts a fresh, correctly signed body', () => {
  const body = '{"event":"message.answered"}'
  assert.equal(verifyAckPushSignature(SECRET, sign(1000, body), body, 1010), true)
})

test('rejects a tampered body, wrong secret, stale timestamp, or missing header', () => {
  const body = '{"event":"message.answered"}'
  assert.equal(verifyAckPushSignature(SECRET, sign(1000, body), body + ' ', 1000), false)
  assert.equal(verifyAckPushSignature(SECRET, sign(1000, body, 'other'), body, 1000), false)
  assert.equal(verifyAckPushSignature(SECRET, sign(1000, body), body, 1000 + 301), false)
  assert.equal(verifyAckPushSignature(SECRET, null, body, 1000), false)
  assert.equal(verifyAckPushSignature(SECRET, 't=abc,v1=00', body, 1000), false)
  assert.equal(verifyAckPushSignature('', sign(1000, body, ''), body, 1000), false)
})

test('maps only answered switch actions', () => {
  assert.equal(switchActionFrom({ event: 'message.answered', response: { action_key: 'disable_ai' } }), 'disable')
  assert.equal(switchActionFrom({ event: 'message.answered', response: { action_key: 'enable_ai' } }), 'enable')
  assert.equal(switchActionFrom({ event: 'message.snoozed', response: { action_key: 'disable_ai' } }), null)
  assert.equal(switchActionFrom({ event: 'message.answered', response: { action_key: 'reply' } }), null)
  assert.equal(switchActionFrom({ event: 'message.answered', response: null }), null)
  assert.equal(switchActionFrom('nope'), null)
})

test('visitor contact is optional and validated', () => {
  assert.deepEqual(parseVisitorContact(undefined, undefined), { ok: true, contact: { name: null, email: null } })
  assert.deepEqual(parseVisitorContact('  Ann ', ' ann@corp.com '), { ok: true, contact: { name: 'Ann', email: 'ann@corp.com' } })
  assert.deepEqual(parseVisitorContact('', ''), { ok: true, contact: { name: null, email: null } })
  assert.equal(parseVisitorContact('Ann', 'not-an-email').ok, false)
  assert.equal(parseVisitorContact('x'.repeat(101), '').ok, false)
  assert.equal(parseVisitorContact(42, '').ok, false)
})

test('messages are clipped to AckPush limits', () => {
  const m = fitMessage({ title: 'x'.repeat(300), body: 'y'.repeat(5000) })
  assert.equal(m.title.length, 200)
  assert.equal(m.body?.length, 4000)
  assert.equal(fitMessage({ title: '  ' }).title, 'tarekalaaddin.com')
})

test('job hint is the first non-empty line', () => {
  assert.equal(jobHint('\n\n  Senior Engineer, Payments  \nWe are hiring'), 'Senior Engineer, Payments')
})
