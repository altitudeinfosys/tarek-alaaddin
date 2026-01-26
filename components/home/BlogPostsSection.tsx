'use client'

import { useState } from 'react'
import { BlogPostMeta } from '@/types/blog'
import BlogCard from '@/components/blog/BlogCard'
import Button from '@/components/ui/Button'
import Link from 'next/link'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'ai', label: 'AI' },
  { id: 'development', label: 'Development' },
]

interface BlogPostsSectionProps {
  allPosts: BlogPostMeta[]
  featuredPosts: BlogPostMeta[]
}

export default function BlogPostsSection({ allPosts, featuredPosts }: BlogPostsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Filter posts by category
  const filteredPosts = selectedCategory === 'all'
    ? allPosts.slice(0, 6)
    : allPosts.filter(post => post.category === selectedCategory).slice(0, 6)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Featured</h3>
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                Editor's Pick
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map(post => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Latest Posts
          </h2>

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

          {/* View All CTA */}
          <div className="text-center">
            <Link href="/blog">
              <Button size="lg" variant="outline">
                View All Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
