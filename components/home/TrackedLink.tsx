'use client'

import Link from 'next/link'
import { track } from '@vercel/analytics'
import { ReactNode } from 'react'

interface TrackedLinkProps {
  href: string
  event: string
  className?: string
  children: ReactNode
}

// Internal link that fires a Vercel Analytics event on click so homepage
// conversions (resume, contact) are measurable.
export default function TrackedLink({ href, event, className, children }: TrackedLinkProps) {
  return (
    <Link href={href} className={className} onClick={() => track(event)}>
      {children}
    </Link>
  )
}
