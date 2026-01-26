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
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentCategory === category.id
              ? 'bg-primary-600 text-white dark:bg-primary-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <span className="mr-2">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  )
}
