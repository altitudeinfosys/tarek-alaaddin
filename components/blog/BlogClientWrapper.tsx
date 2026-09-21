'use client'

import { useState, useMemo } from 'react'
import { BlogPostMeta } from '@/types/blog'
import BlogCard from './BlogCard'
import { categoryGroup } from '@/lib/categories'
import CategoryFilter from './CategoryFilter'
import SearchInput from './SearchInput'
import { useSearch } from '@/hooks/useSearch'

interface BlogClientWrapperProps {
  posts: BlogPostMeta[]
}

export default function BlogClientWrapper({ posts }: BlogClientWrapperProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { query, setQuery, matchingSlugs, isLoading, loadIndex } = useSearch()

  const filteredPosts = useMemo(() => {
    let result = posts

    if (selectedCategory !== 'all') {
      result = result.filter((post) => categoryGroup(post.category) === selectedCategory)
    }

    if (matchingSlugs !== null) {
      result = result.filter((post) => matchingSlugs.has(post.slug))
    }

    return result
  }, [posts, selectedCategory, matchingSlugs])

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-[76rem] mx-auto py-14 md:py-[4.5rem] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="eyebrow eyebrow-accent mb-3">Writing</div>
          <h1 className="font-display font-bold tracking-[-0.035em] leading-[1.02] text-[2.5rem] sm:text-6xl text-gray-900 dark:text-white mb-4">
            Blog
          </h1>
          <p className="text-[1.15rem] text-gray-700 dark:text-gray-300 max-w-2xl">
            Insights on productivity, AI tools, software engineering, and building SaaS products
          </p>
          <a
            href="/feed.xml"
            className="inline-flex items-center gap-1.5 mt-4 font-mono text-xs uppercase tracking-[0.08em] text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            aria-label="RSS feed"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20 5 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z" />
            </svg>
            RSS
          </a>
        </div>

        {/* Search */}
        <div className="mb-5">
          <SearchInput
            value={query}
            onChange={setQuery}
            onFocus={loadIndex}
            isLoading={isLoading}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            currentCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Result count */}
        {query && matchingSlugs !== null && (
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-gray-600 dark:text-gray-400 mb-6">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} found
          </p>
        )}

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {query
                ? `No posts found for "${query}"${selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}. Try a different search term.`
                : 'No posts found in this category yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
