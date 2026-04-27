import type { Metadata } from 'next'
import ResumePageClient from '@/components/ResumePageClient'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Resume | Tarek Alaaddin',
  description:
    'Review Tarek Alaaddin\'s software engineering resume, experience, technical skills, and AI-powered job fit checker.',
  alternates: {
    canonical: absoluteUrl('/resume'),
  },
  openGraph: {
    title: 'Resume | Tarek Alaaddin',
    description:
      'Software engineering resume, experience, technical skills, and AI-powered job fit checker for Tarek Alaaddin.',
    url: absoluteUrl('/resume'),
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'profile',
  },
}

export default function ResumePage() {
  return <ResumePageClient />
}
