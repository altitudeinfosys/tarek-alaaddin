'use client'

import { useState } from 'react'

interface CodeBlockProps {
  children: string
  language?: string
  filename?: string
}

export default function CodeBlock({ children, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {filename && (
            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
              {filename}
            </span>
          )}
          {language && !filename && (
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-2 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto">
        <pre className="text-sm">
          <code className="text-gray-800 dark:text-gray-200 font-mono">
            {children}
          </code>
        </pre>
      </div>
    </div>
  )
}
