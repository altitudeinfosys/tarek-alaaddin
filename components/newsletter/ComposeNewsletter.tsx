'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { matchesSubscriber } from '@/lib/email/recipients'

export interface PickerSubscriber {
  id: string
  email: string
  firstName: string | null
}

interface Props {
  viewKey: string
  defaultTestTo: string
  /** Active subscribers, for the "Specific subscribers" search. */
  subscribers: PickerSubscriber[]
}

type AudienceType = 'all' | 'selected'

interface StoredDraft {
  subject: string
  markdown: string
  sendKey: string
  audience: AudienceType
  selectedIds: string[]
  /** Set once any part of this draft went out, so the content can't drift between retries. */
  locked: boolean
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'busy'; label: string }
  | { kind: 'confirm'; recipients: number; alreadySent: number; recipientEmails?: string[]; skipped?: number }
  | { kind: 'done'; message: string; tone: 'ok' | 'warn' | 'error' }

const STORAGE_KEY = 'newsletter-compose-draft'
const MAX_RESULTS = 8
const MAX_NAMES_IN_CONFIRM = 5

function newSendKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
}

function emptyDraft(): StoredDraft {
  return { subject: '', markdown: '', sendKey: newSendKey(), audience: 'all', selectedIds: [], locked: false }
}

function loadDraft(): StoredDraft {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDraft()
    const parsed = JSON.parse(raw) as Partial<StoredDraft>
    return {
      subject: typeof parsed.subject === 'string' ? parsed.subject : '',
      markdown: typeof parsed.markdown === 'string' ? parsed.markdown : '',
      sendKey: typeof parsed.sendKey === 'string' && parsed.sendKey.length >= 8 ? parsed.sendKey : newSendKey(),
      audience: parsed.audience === 'selected' ? 'selected' : 'all',
      selectedIds: Array.isArray(parsed.selectedIds)
        ? parsed.selectedIds.filter((id): id is string => typeof id === 'string')
        : [],
      locked: parsed.locked === true,
    }
  } catch {
    return emptyDraft()
  }
}

function saveDraft(draft: StoredDraft) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Private mode or blocked storage: the draft just won't survive a reload.
  }
}

const inputClass =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60'
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
const buttonBase =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

function confirmNames(emails: string[]): string {
  const shown = emails.slice(0, MAX_NAMES_IN_CONFIRM).join(', ')
  const more = emails.length - MAX_NAMES_IN_CONFIRM
  return more > 0 ? `${shown} and ${more} more` : shown
}

export default function ComposeNewsletter({ viewKey, defaultTestTo, subscribers }: Props) {
  const [draft, setDraft] = useState<StoredDraft | null>(null)
  const [secret, setSecret] = useState('')
  const [testTo, setTestTo] = useState(defaultTestTo)
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewError, setPreviewError] = useState('')
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [search, setSearch] = useState('')
  const previewSeq = useRef(0)

  const byId = useMemo(() => new Map(subscribers.map((s) => [s.id, s])), [subscribers])

  useEffect(() => {
    setDraft(loadDraft())
  }, [])

  const update = useCallback((patch: Partial<StoredDraft>) => {
    setDraft((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      saveDraft(next)
      return next
    })
  }, [])

  // Live preview, rendered by the server with the same template subscribers get.
  useEffect(() => {
    if (!draft) return
    if (!draft.subject.trim() || !draft.markdown.trim()) {
      setPreviewHtml('')
      setPreviewError('')
      return
    }
    const seq = ++previewSeq.current
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/newsletter/compose/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-view-key': viewKey },
          body: JSON.stringify({ subject: draft.subject, markdown: draft.markdown }),
        })
        const data = await res.json()
        if (seq !== previewSeq.current) return
        if (!res.ok) {
          setPreviewError(data.error || 'Preview failed')
          return
        }
        setPreviewError('')
        setPreviewHtml(data.html)
      } catch {
        if (seq === previewSeq.current) setPreviewError('Preview failed')
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [draft, viewKey])

  if (!draft) {
    return <p className="text-sm text-gray-500">Loading…</p>
  }

  const selectedSet = new Set(draft.selectedIds)
  const selectedKnown = draft.selectedIds.map((id) => byId.get(id)).filter((s): s is PickerSubscriber => !!s)
  const selectedGone = draft.selectedIds.length - selectedKnown.length
  const results = search.trim()
    ? subscribers.filter((s) => !selectedSet.has(s.id) && matchesSubscriber(search, s)).slice(0, MAX_RESULTS)
    : []
  const audienceReady = draft.audience === 'all' || draft.selectedIds.length > 0
  const ready = draft.subject.trim().length > 0 && draft.markdown.trim().length > 0 && audienceReady
  const busy = phase.kind === 'busy'
  const canSend = ready && secret.length > 0 && !busy

  function audiencePayload() {
    if (!draft || draft.audience === 'all') return { type: 'all' as const }
    return { type: 'selected' as const, subscriberIds: draft.selectedIds }
  }

  function addRecipient(id: string) {
    if (!draft || draft.locked || selectedSet.has(id)) return
    update({ selectedIds: [...draft.selectedIds, id] })
    setSearch('')
  }

  function removeRecipient(id: string) {
    if (!draft || draft.locked) return
    update({ selectedIds: draft.selectedIds.filter((x) => x !== id) })
  }

  async function post(path: string, payload: Record<string, unknown>) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    return { res, data }
  }

  async function sendTest() {
    if (!draft) return
    setPhase({ kind: 'busy', label: 'Sending test…' })
    const { res, data } = await post('/api/newsletter/compose/test', {
      subject: draft.subject,
      markdown: draft.markdown,
      to: testTo,
    })
    if (res.status === 401) {
      setPhase({ kind: 'done', tone: 'error', message: 'That secret was not accepted.' })
    } else if (!res.ok) {
      setPhase({ kind: 'done', tone: 'error', message: data.error || 'Test send failed.' })
    } else {
      setPhase({ kind: 'done', tone: 'ok', message: `Test sent to ${data.to}. Check your inbox.` })
    }
  }

  async function reviewSend() {
    if (!draft) return
    setPhase({ kind: 'busy', label: 'Counting recipients…' })
    const { res, data } = await post('/api/newsletter/compose/send', {
      subject: draft.subject,
      markdown: draft.markdown,
      sendKey: draft.sendKey,
      audience: audiencePayload(),
      dryRun: true,
    })
    if (res.status === 401) {
      setPhase({ kind: 'done', tone: 'error', message: 'That secret was not accepted.' })
    } else if (!res.ok) {
      setPhase({ kind: 'done', tone: 'error', message: data.error || 'Could not count subscribers.' })
    } else if (data.recipients === 0) {
      setPhase({
        kind: 'done',
        tone: 'warn',
        message: data.alreadySent
          ? `Everyone already has this email (${data.alreadySent} sent).`
          : draft.audience === 'selected'
            ? 'None of the people you picked are active subscribers.'
            : 'There are no active subscribers to send to.',
      })
    } else {
      setPhase({
        kind: 'confirm',
        recipients: data.recipients,
        alreadySent: data.alreadySent,
        recipientEmails: data.recipientEmails,
        skipped: data.skipped,
      })
    }
  }

  async function confirmSend(expected: number) {
    if (!draft) return
    setPhase({ kind: 'busy', label: `Sending to ${expected} ${expected === 1 ? 'person' : 'people'}…` })
    // Lock content and audience: a retry with this sendKey must go to the same people.
    update({ locked: true })
    const { res, data } = await post('/api/newsletter/compose/send', {
      subject: draft.subject,
      markdown: draft.markdown,
      sendKey: draft.sendKey,
      audience: audiencePayload(),
      expectedRecipients: expected,
    })
    if (res.status === 409 && typeof data.recipients === 'number') {
      setPhase({
        kind: 'confirm',
        recipients: data.recipients,
        alreadySent: data.alreadySent ?? 0,
        recipientEmails: data.recipientEmails,
        skipped: data.skipped,
      })
      return
    }
    if (!res.ok && res.status !== 207) {
      setPhase({ kind: 'done', tone: 'error', message: data.error || 'Send failed. Nothing was recorded as sent.' })
      return
    }
    if (data.status === 'partial') {
      setPhase({
        kind: 'done',
        tone: 'warn',
        message: `Sent to ${data.recipients} so far, but some batches failed (${data.error}). Press the send button again to retry only the ones who didn't get it.`,
      })
      return
    }
    setPhase({
      kind: 'done',
      tone: 'ok',
      message: `Sent to ${data.recipients} ${data.recipients === 1 ? 'person' : 'people'}.`,
    })
  }

  function startNew() {
    const fresh = emptyDraft()
    saveDraft(fresh)
    setDraft(fresh)
    setPreviewHtml('')
    setSearch('')
    setPhase({ kind: 'idle' })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label htmlFor="compose-subject" className={labelClass}>Subject</label>
            <input
              id="compose-subject"
              type="text"
              maxLength={200}
              value={draft.subject}
              disabled={draft.locked}
              onChange={(e) => update({ subject: e.target.value })}
              className={inputClass}
              placeholder="New videos are up on the site"
            />
          </div>
          <div>
            <label htmlFor="compose-body" className={labelClass}>Body (Markdown)</label>
            <textarea
              id="compose-body"
              rows={16}
              value={draft.markdown}
              disabled={draft.locked}
              onChange={(e) => update({ markdown: e.target.value })}
              className={`${inputClass} font-mono`}
              placeholder={'Hey,\n\nI just posted my YouTube videos on the site: [watch them here](https://www.tarekalaaddin.com/videos).\n\n— Tarek'}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              **bold**, _italic_, [link](https://…), lists and headings work. Your draft is saved in this browser.
              An unsubscribe link is added at the bottom automatically.
            </p>
          </div>
          {draft.locked && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-900/30 p-3 text-sm text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
              <span>This email has gone out, so it can't be edited.</span>
              <button type="button" onClick={startNew} className={`${buttonBase} bg-amber-600 text-white hover:bg-amber-700`}>
                Start a new email
              </button>
            </div>
          )}
        </div>

        <fieldset
          disabled={draft.locked}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4"
        >
          <legend className="sr-only">Recipients</legend>
          <p className={labelClass}>Send to</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {(
              [
                ['all', `All subscribers (${subscribers.length})`],
                ['selected', 'Specific subscribers'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`flex-1 flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${
                  draft.audience === value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="compose-audience"
                  value={value}
                  checked={draft.audience === value}
                  onChange={() => {
                    update({ audience: value })
                    setPhase({ kind: 'idle' })
                  }}
                />
                {label}
              </label>
            ))}
          </div>

          {draft.audience === 'selected' && (
            <div className="space-y-3">
              <div className="relative">
                <label htmlFor="compose-search" className="sr-only">Search subscribers</label>
                <input
                  id="compose-search"
                  type="search"
                  autoComplete="off"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (results[0]) addRecipient(results[0].id)
                    }
                  }}
                  className={inputClass}
                  placeholder="Search by email or name"
                />
                {search.trim() && (
                  <ul className="absolute z-10 mt-1 w-full max-h-72 overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                    {results.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No active subscriber matches.</li>
                    ) : (
                      results.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => addRecipient(s.id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <span className="text-gray-900 dark:text-white">{s.email}</span>
                            {s.firstName && <span className="ml-2 text-gray-500 dark:text-gray-400">{s.firstName}</span>}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {selectedKnown.length > 0 ? (
                <ul className="flex flex-wrap gap-2" aria-label="Selected recipients">
                  {selectedKnown.map((s) => (
                    <li
                      key={s.id}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 pl-3 pr-1 py-1 text-sm text-gray-800 dark:text-gray-100"
                    >
                      {s.email}
                      <button
                        type="button"
                        onClick={() => removeRecipient(s.id)}
                        aria-label={`Remove ${s.email}`}
                        className="rounded-full w-6 h-6 leading-none text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:hidden"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">Nobody picked yet.</p>
              )}
              {selectedGone > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {selectedGone} picked {selectedGone === 1 ? 'person is' : 'people are'} no longer active and won&apos;t get it.
                </p>
              )}
            </div>
          )}
        </fieldset>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label htmlFor="compose-secret" className={labelClass}>Send secret (CRON_SECRET)</label>
            <input
              id="compose-secret"
              type="password"
              autoComplete="off"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Kept only in this tab. Never saved or put in the URL.</p>
          </div>
          <div>
            <label htmlFor="compose-test-to" className={labelClass}>Test address</label>
            <div className="flex gap-2">
              <input
                id="compose-test-to"
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={sendTest}
                disabled={!canSend || !testTo}
                className={`${buttonBase} whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                Send test
              </button>
            </div>
          </div>

          {phase.kind === 'confirm' ? (
            <div className="rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4 space-y-3">
              <p className="text-sm text-gray-900 dark:text-white">
                Send <strong>&ldquo;{draft.subject}&rdquo;</strong> to <strong>{phase.recipients}</strong>{' '}
                {phase.alreadySent > 0 ? 'remaining ' : ''}
                {draft.audience === 'selected'
                  ? phase.recipients === 1 ? 'person' : 'people'
                  : phase.recipients === 1 ? 'subscriber' : 'subscribers'}
                {phase.recipientEmails && phase.recipientEmails.length > 0 && <>: {confirmNames(phase.recipientEmails)}</>}?
                {phase.alreadySent > 0 && ` (${phase.alreadySent} already got it.)`} This can&apos;t be undone.
              </p>
              {!!phase.skipped && phase.skipped > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {phase.skipped} picked {phase.skipped === 1 ? 'person is' : 'people are'} no longer active and will be skipped.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => confirmSend(phase.recipients)}
                  className={`${buttonBase} bg-red-600 text-white hover:bg-red-700`}
                >
                  Yes, send to {phase.recipients}
                </button>
                <button
                  type="button"
                  onClick={() => setPhase({ kind: 'idle' })}
                  className={`${buttonBase} border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={reviewSend}
              disabled={!canSend}
              className={`${buttonBase} w-full bg-primary-600 text-white hover:bg-primary-700`}
            >
              {draft.audience === 'selected'
                ? `Send to ${draft.selectedIds.length} selected…`
                : 'Send to all subscribers…'}
            </button>
          )}

          {phase.kind === 'busy' && <p className="text-sm text-gray-600 dark:text-gray-400">{phase.label}</p>}
          {phase.kind === 'done' && (
            <p
              role="status"
              className={`text-sm ${
                phase.tone === 'ok'
                  ? 'text-green-700 dark:text-green-400'
                  : phase.tone === 'warn'
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-red-700 dark:text-red-400'
              }`}
            >
              {phase.message}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview</h2>
        {previewError && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{previewError}</p>}
        {previewHtml ? (
          <iframe
            title="Email preview"
            srcDoc={previewHtml}
            sandbox=""
            className="w-full flex-1 min-h-[600px] rounded border border-gray-200 dark:border-gray-700 bg-black"
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Add a subject and body to see the email.</p>
        )}
      </div>
    </div>
  )
}
