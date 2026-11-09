// Run with: npm test  (node:test, Node strips the TypeScript types)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseAudience, matchesSubscriber, MAX_SELECTED_RECIPIENTS } from './recipients.ts'

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'

test('missing audience means all subscribers', () => {
  assert.deepEqual(parseAudience(undefined), { ok: true, audience: { type: 'all' } })
  assert.deepEqual(parseAudience(null), { ok: true, audience: { type: 'all' } })
})

test('explicit all', () => {
  assert.deepEqual(parseAudience({ type: 'all', subscriberIds: [A] }), { ok: true, audience: { type: 'all' } })
})

test('selected ids are deduped, lowercased and sorted', () => {
  const r = parseAudience({ type: 'selected', subscriberIds: [B, A.toUpperCase(), A] })
  assert.deepEqual(r, { ok: true, audience: { type: 'selected', subscriberIds: [A, B] } })
})

test('selected needs at least one valid id', () => {
  assert.equal(parseAudience({ type: 'selected', subscriberIds: [] }).ok, false)
  assert.equal(parseAudience({ type: 'selected' }).ok, false)
  assert.equal(parseAudience({ type: 'selected', subscriberIds: [42] }).ok, false)
  assert.equal(parseAudience({ type: 'selected', subscriberIds: ['not-a-uuid'] }).ok, false)
  assert.equal(parseAudience({ type: 'selected', subscriberIds: [A, "x' OR 1=1"] }).ok, false)
})

test('selected is capped', () => {
  const ids = Array.from({ length: MAX_SELECTED_RECIPIENTS + 1 }, (_, i) =>
    `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
  )
  assert.equal(parseAudience({ type: 'selected', subscriberIds: ids }).ok, false)
  assert.equal(parseAudience({ type: 'selected', subscriberIds: ids.slice(1) }).ok, true)
})

test('unknown types are rejected', () => {
  assert.equal(parseAudience({ type: 'everyone' }).ok, false)
  assert.equal(parseAudience('all').ok, false)
})

test('search matches email or first name, ignoring case', () => {
  const sub = { email: 'Ana@Example.com', firstName: 'Ana' }
  assert.equal(matchesSubscriber('example', sub), true)
  assert.equal(matchesSubscriber('ANA', sub), true)
  assert.equal(matchesSubscriber('bob', sub), false)
  assert.equal(matchesSubscriber('   ', sub), false)
  assert.equal(matchesSubscriber('ana', { email: 'x@y.com', firstName: null }), false)
})
