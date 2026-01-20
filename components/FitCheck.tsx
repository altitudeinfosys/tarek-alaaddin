'use client'

import { useState } from 'react'

interface FitCheckResult {
  score: number
  strengths: string[]
  gaps: string[]
  assessment: string
  resumeType: string
}

export default function FitCheck() {
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FitCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobDescription.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/resume/api/fit-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jobDescription.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze job fit')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error('Fit check error:', err)
      setError('Failed to analyze job fit. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="card p-6">
        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Paste the job description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={8}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none placeholder-gray-400 dark:placeholder-gray-500"
          disabled={isLoading}
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {jobDescription.length > 0 && `${jobDescription.split(/\s+/).length} words`}
          </p>
          <button
            type="submit"
            disabled={!jobDescription.trim() || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Check Fit
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="card p-4 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Score Card */}
          <div className={`card p-6 ${getScoreBackground(result.score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Match Score</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on {result.resumeType} resume
                </p>
              </div>
              <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
            </div>
          </div>

          {/* Assessment */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Honest Assessment</h3>
            <p className="text-gray-700 dark:text-gray-300">{result.assessment}</p>
          </div>

          {/* Strengths */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Strong Matches
            </h3>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li key={index} className="flex gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          {result.gaps.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Potential Gaps
              </h3>
              <ul className="space-y-2">
                {result.gaps.map((gap, index) => (
                  <li key={index} className="flex gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Try Again */}
          <div className="text-center">
            <button
              onClick={() => {
                setResult(null)
                setJobDescription('')
              }}
              className="btn-secondary"
            >
              Try Another Job
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
