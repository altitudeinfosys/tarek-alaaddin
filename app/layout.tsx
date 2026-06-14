import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterPopup from '@/components/NewsletterPopup'
import { Analytics } from '@vercel/analytics/react'
import { PersonSchema, WebSiteSchema } from '@/components/JsonLd'
import { SITE_URL, absoluteUrl } from '@/lib/site'

const inter = Inter({ subsets: ['latin'] })
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Tarek Alaaddin | Software Engineer & Product Builder',
  description: 'Software engineer with expertise in backend development, cloud architecture, and full-stack applications. Creator of Taskitos and ExpandNote.',
  keywords: ['software engineer', 'backend developer', 'full-stack', 'cloud architecture', 'AI products', 'SaaS'],
  authors: [{ name: 'Tarek Alaaddin' }],
  openGraph: {
    title: 'Tarek Alaaddin | Software Engineer & Product Builder',
    description: 'Software engineer with expertise in backend development, cloud architecture, and full-stack applications. Creator of Taskitos and ExpandNote.',
    url: absoluteUrl(),
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarek Alaaddin | Software Engineer & Product Builder',
    description: 'Software engineer with expertise in backend development, cloud architecture, and full-stack applications.',
    creator: '@tarekalaaddin',
    site: '@tarekalaaddin',
  },
  alternates: {
    canonical: absoluteUrl(),
    types: {
      'application/rss+xml': [
        { url: absoluteUrl('/feed.xml'), title: 'Tarek Alaaddin — Blog' },
      ],
    },
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PersonSchema />
        <WebSiteSchema />
      </head>
      <body className={`${inter.className} ${bricolage.variable}`}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <NewsletterPopup />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
