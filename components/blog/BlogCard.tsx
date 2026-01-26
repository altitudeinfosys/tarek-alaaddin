import Link from 'next/link'
import { BlogPostMeta } from '@/types/blog'
import Badge from '@/components/ui/Badge'

interface BlogCardProps {
  post: BlogPostMeta
}

export default function BlogCard({ post }: BlogCardProps) {
  const categoryColors = {
    ai: 'info' as const,
    productivity: 'success' as const,
    development: 'default' as const,
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all hover:shadow-lg p-6">
        {/* Category & Date */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant={categoryColors[post.category]}>
            {post.category}
          </Badge>
          <time className="text-sm text-gray-500 dark:text-gray-400">
            {formattedDate}
          </time>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {post.description}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Read More */}
        <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm">
          Read more
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </article>
    </Link>
  )
}
