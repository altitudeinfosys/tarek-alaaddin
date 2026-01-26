import Button from '@/components/ui/Button'

interface ProductCTAProps {
  product: 'taskitos' | 'expandnote'
}

export default function ProductCTA({ product }: ProductCTAProps) {
  const products = {
    taskitos: {
      name: 'Taskitos',
      tagline: 'Never Miss a Task Ever Again',
      description: 'AI-powered task manager with persistent reminders that ensures you complete what matters.',
      url: 'https://taskitos.com',
      color: 'primary',
    },
    expandnote: {
      name: 'ExpandNote',
      tagline: 'Your Notes, Supercharged by AI',
      description: 'Note-taking app with AI automation profiles that processes your notes intelligently.',
      url: 'https://expandnote.com',
      color: 'primary',
    },
  }

  const p = products[product]

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-primary-200 dark:border-gray-700">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          {p.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {p.name}
          </h3>
          <p className="text-primary-600 dark:text-primary-400 font-semibold mb-2">
            {p.tagline}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {p.description}
          </p>
          <div className="flex gap-3">
            <Button href={p.url} size="sm">
              Try {p.name}
            </Button>
            <Button href="/products" variant="outline" size="sm">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
