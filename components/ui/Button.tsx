import { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  fullWidth?: boolean
  href?: string
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  href,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 dark:bg-primary-500 dark:hover:bg-primary-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const widthStyles = fullWidth ? 'w-full' : ''
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`

  // If href is provided, render as Link (internal) or anchor (external)
  if (href) {
    const isExternal = href.startsWith('http://') || href.startsWith('https://')

    if (isExternal) {
      return (
        <a
          href={href}
          className={combinedStyles}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      )
    }

    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    )
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={combinedStyles}
      {...props}
    >
      {children}
    </button>
  )
}
