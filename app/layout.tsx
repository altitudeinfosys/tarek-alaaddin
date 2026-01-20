import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tarek Alaaddin | Software Engineer',
  description: 'Software engineer with expertise in backend development, cloud architecture, and full-stack applications. Explore my experience and ask my AI assistant about my background.',
  keywords: ['software engineer', 'backend developer', 'full-stack', 'cloud architecture', 'resume'],
  authors: [{ name: 'Tarek Alaaddin' }],
  openGraph: {
    title: 'Tarek Alaaddin | Software Engineer',
    description: 'Software engineer with expertise in backend development, cloud architecture, and full-stack applications.',
    url: 'https://tarekalaaddin.com',
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarek Alaaddin | Software Engineer',
    description: 'Software engineer with expertise in backend development, cloud architecture, and full-stack applications.',
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
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
