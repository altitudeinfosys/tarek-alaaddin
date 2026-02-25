import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterPopup from '@/components/NewsletterPopup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tarek Alaaddin | Software Engineer & Product Builder',
  description: 'Software engineer with expertise in backend development, cloud architecture, and full-stack applications. Creator of Taskitos and ExpandNote.',
  keywords: ['software engineer', 'backend developer', 'full-stack', 'cloud architecture', 'AI products', 'SaaS'],
  authors: [{ name: 'Tarek Alaaddin' }],
  openGraph: {
    title: 'Tarek Alaaddin | Software Engineer & Product Builder',
    description: 'Software engineer with expertise in backend development, cloud architecture, and full-stack applications. Creator of Taskitos and ExpandNote.',
    url: 'https://tarekalaaddin.com',
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarek Alaaddin | Software Engineer & Product Builder',
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
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <NewsletterPopup />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
