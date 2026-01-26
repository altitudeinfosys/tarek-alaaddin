import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
  const hoverStyles = hover
    ? 'transition-all hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-400'
    : ''

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  )
}
