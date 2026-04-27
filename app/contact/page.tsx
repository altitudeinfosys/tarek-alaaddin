import type { Metadata } from 'next'
import ContactPageClient from '@/components/ContactPageClient'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact | Tarek Alaaddin',
  description:
    'Contact Tarek Alaaddin about software engineering roles, consulting, product collaboration, or AI-powered SaaS projects.',
  alternates: {
    canonical: absoluteUrl('/contact'),
  },
  openGraph: {
    title: 'Contact | Tarek Alaaddin',
    description:
      'Get in touch with Tarek Alaaddin about engineering opportunities, consulting, collaboration, or SaaS projects.',
    url: absoluteUrl('/contact'),
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
