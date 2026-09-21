'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { track } from '@vercel/analytics'
import { useTheme } from './ThemeProvider'
import { useState } from 'react'

const NAVIGATION_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Apps', href: '/products' },
  { name: 'Contact', href: '/contact' },
]

const RESUME_CTA = { name: 'View resume', href: '/resume' }

export default function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const themeIcon =
    theme === 'light' ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-300 dark:border-gray-800">
      <nav className="max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[3.75rem]">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-display text-base font-bold tracking-[-0.01em] text-gray-900 dark:text-white">
              Tarek Alaaddin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {NAVIGATION_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-1.5 rounded-[5px] transition-colors ${
                  isActive(link.href)
                    ? 'bg-gray-100 text-gray-900 font-medium dark:bg-gray-800 dark:text-white'
                    : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Primary CTA */}
            <Link
              href={RESUME_CTA.href}
              onClick={() => track('resume_click_nav')}
              className={`ml-4 text-sm font-semibold px-3.5 py-2 rounded-md transition-colors ${
                isActive(RESUME_CTA.href)
                  ? 'bg-primary-700 text-white dark:bg-primary-300 dark:text-gray-950'
                  : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-400 dark:hover:bg-primary-300 dark:text-gray-950'
              }`}
            >
              {RESUME_CTA.name}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {themeIcon}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {themeIcon}
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {NAVIGATION_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={RESUME_CTA.href}
              onClick={() => {
                setMobileMenuOpen(false)
                track('resume_click_nav')
              }}
              className="block mx-4 mt-3 px-4 py-2.5 rounded-md text-center text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-400 dark:hover:bg-primary-300 dark:text-gray-950 transition-colors"
            >
              {RESUME_CTA.name}
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
