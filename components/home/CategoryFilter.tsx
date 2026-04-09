'use client'

import { useState } from 'react'
import { BlogPostMeta } from '@/types/blog'
import BlogCard from '@/components/blog/BlogCard'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'ai', label: 'AI' },
  { id: 'development', label: 'Development' },
]

interface CategoryFilterProps {
  posts: BlogPostMeta[]
}

export default function CategoryFilter({ posts }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredPosts = selectedCategory === 'all'
    ? posts.slice(0, 6)
    : posts.filter(post => post.category === selectedCategory).slice(0, 6)

  return (
    <>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredPosts.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          No posts found in this category.
        </div>
      )}
    </>
  )
}
