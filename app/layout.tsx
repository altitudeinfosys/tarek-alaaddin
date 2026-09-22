import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google'
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
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Tarek Alaaddin | AI Engineer Building Agents & Apps',
  description: 'AI engineer building autonomous agents and shipping full-stack apps, backed by 20+ years of enterprise Java and React. Open to senior engineering roles.',
  keywords: ['AI engineer', 'AI agents', 'AI automation', 'full-stack developer', 'software engineer', 'Java', 'React'],
  authors: [{ name: 'Tarek Alaaddin' }],
  openGraph: {
    title: 'Tarek Alaaddin | AI Engineer Building Agents & Apps',
    description: 'AI engineer building autonomous agents and shipping full-stack apps, backed by 20+ years of enterprise Java and React. Open to senior engineering roles.',
    url: absoluteUrl(),
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarek Alaaddin | AI Engineer Building Agents & Apps',
    description: 'AI engineer building autonomous agents and shipping full-stack apps, backed by 20+ years of enterprise Java and React. Open to senior engineering roles.',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Runs before first paint: the page starts dark; drop the class only if the visitor chose light */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme-choice')==='light')document.documentElement.classList.remove('dark')}catch(e){}",
          }}
        />
        <PersonSchema />
        <WebSiteSchema />
      </head>
      <body className={`${inter.className} ${bricolage.variable} ${jetbrainsMono.variable}`}>
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
