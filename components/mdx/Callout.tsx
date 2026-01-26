import { ReactNode } from 'react'

interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'danger'
  children: ReactNode
}

export default function Callout({ type = 'info', children }: CalloutProps) {
  const styles = {
    info: {
      container: 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800',
      icon: 'text-primary-600 dark:text-primary-400',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    tip: {
      container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    },
    danger: {
      container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  }

  const style = styles[type]

  return (
    <div className={`flex items-start p-4 my-6 rounded-lg border-2 ${style.container}`}>
      <svg
        className={`w-6 h-6 mr-3 flex-shrink-0 ${style.icon}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.iconPath} />
      </svg>
      <div className="flex-1 text-gray-800 dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  )
}
