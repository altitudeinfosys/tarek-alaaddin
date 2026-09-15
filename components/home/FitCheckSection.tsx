'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'
import FitCheck from '@/components/FitCheck'

// The fit-check tool from /resume, promoted to the homepage. The form is
// revealed on click so the Claude-backed API isn't a drive-by POST target for
// every homepage visit.
export default function FitCheckSection() {
  const [open, setOpen] = useState(false)

  return (
    <section id="fit-check" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white p-8 md:p-12">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-sm font-semibold uppercase tracking-widest text-primary-100 mb-2">Hiring?</div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-balance">
                Paste the job description. See if I&apos;m a fit in 20 seconds.
              </h2>
              <p className="mt-4 text-primary-100 max-w-lg">
                An agent I built on my own work history scores the match, calls out gaps honestly, and links
                the relevant experience. It&apos;s a working sample of what I do — no form, no email required.
              </p>
            </div>

            {!open ? (
              <div className="flex lg:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(true)
                    track('fit_check_open')
                  }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-primary-700 font-semibold hover:bg-primary-50 transition shadow-lg"
                >
                  Try it
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>

          {open && (
            <div className="relative mt-8 text-gray-900 dark:text-gray-100">
              <FitCheck />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
