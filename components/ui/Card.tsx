import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const baseStyles = 'bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800'
  const hoverStyles = hover
    ? 'transition-colors hover:border-primary-600 dark:hover:border-primary-400'
    : ''

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  )
}
