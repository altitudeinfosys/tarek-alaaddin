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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 dark:bg-primary-400 dark:text-gray-950 dark:hover:bg-primary-300',
    secondary: 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:border-primary-600 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-primary-400 dark:hover:text-primary-400',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-[0.92rem]',
    lg: 'px-5 py-3 text-base',
  }

  const widthStyles = fullWidth ? 'w-full' : ''
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`

  // If href is provided, render as Link (internal) or anchor (external)
  if (href) {
    const isExternal = href.startsWith('http://') || href.startsWith('https://')

    // Extract safe props for anchor elements (exclude button-specific props)
    const {
      disabled,
      form,
      formAction,
      formEncType,
      formMethod,
      formNoValidate,
      formTarget,
      value,
      ...anchorProps
    } = props

    const disabledProps = disabled ? { 'aria-disabled': true as const, tabIndex: -1 } : {}

    if (isExternal) {
      return (
        <a
          href={href}
          className={combinedStyles}
          target="_blank"
          rel="noopener noreferrer"
          {...disabledProps}
          {...(anchorProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      )
    }

    return (
      <Link
        href={href}
        className={combinedStyles}
        {...disabledProps}
        {...(anchorProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
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
