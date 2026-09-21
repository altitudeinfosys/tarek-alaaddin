'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'
import FitCheck from '@/components/FitCheck'

const STEPS = [
  'Paste a job description',
  'The agent scores the match against my history',
  'Gaps called out honestly, with links to the relevant experience',
]

// The fit-check tool from /resume, promoted to the homepage. The form is
// revealed on click so the Claude-backed API isn't a drive-by POST target for
// every homepage visit.
export default function FitCheckSection() {
  const [open, setOpen] = useState(false)

  return (
    <section id="fit-check" className="band">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[5fr_6fr] gap-x-16 gap-y-10 items-start">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="chip chip-accent">HIRING?</span>
              <span className="chip">20 seconds</span>
              <span className="chip">No email required</span>
            </div>
            <h2 className="h-section">Paste the job description. See if I&apos;m a fit.</h2>
            <p className="mt-4 text-[1.05rem] text-gray-700 dark:text-gray-300 max-w-lg">
              An agent I built on my own work history scores the match. It&apos;s a working sample of what I do.
            </p>
            {!open ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(true)
                  track('fit_check_open')
                }}
                className="btn-flat btn-flat-primary mt-7"
              >
                Try the fit check
              </button>
            ) : null}
          </div>

          <ol className="border-t border-gray-300 dark:border-gray-800">
            {STEPS.map((step, i) => (
              <li key={step} className="grid gap-1 py-4 border-b border-gray-300 dark:border-gray-800">
                <span className="font-mono text-[0.69rem] uppercase tracking-[0.08em] text-gray-600 dark:text-gray-400">
                  Step {i + 1}
                </span>
                <span className="font-display text-lg font-bold tracking-[-0.01em] text-gray-900 dark:text-white">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {open && (
          <div className="mt-10 text-gray-900 dark:text-gray-100">
            <FitCheck />
          </div>
        )}
      </div>
    </section>
  )
}
