'use client'

interface CategoryFilterProps {
  currentCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { id: 'all', name: 'All Posts', icon: '📚' },
  { id: 'productivity', name: 'Productivity', icon: '✅' },
  { id: 'ai', name: 'AI', icon: '🤖' },
  { id: 'development', name: 'Development', icon: '💻' },
]

export default function CategoryFilter({ currentCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onCategoryChange(category.id)}
          aria-pressed={currentCategory === category.id}
          className={`px-3.5 py-2 rounded-md border text-sm font-medium transition-colors ${
            currentCategory === category.id
              ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-400 dark:bg-primary-400 dark:text-gray-950'
              : 'border-gray-300 bg-white text-gray-700 hover:border-primary-600 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:text-primary-400'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
