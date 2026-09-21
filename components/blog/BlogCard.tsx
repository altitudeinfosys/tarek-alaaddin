import Link from 'next/link'
import { BlogPostMeta } from '@/types/blog'
import Badge from '@/components/ui/Badge'
import { categoryLabel } from '@/lib/categories'

interface BlogCardProps {
  post: BlogPostMeta
}

export default function BlogCard({ post }: BlogCardProps) {
  // Frontmatter categories aren't limited to the three in the type; anything
  // else falls through to the default badge.
  const categoryColors: Record<string, 'info' | 'success' | 'default'> = {
    ai: 'info',
    'ai-tools': 'info',
    productivity: 'success',
    development: 'default',
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="panel h-full flex flex-col gap-3 p-6 transition-colors group-hover:border-primary-600 dark:group-hover:border-primary-400">
        {/* Date & Category */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <time className="font-mono text-[0.69rem] uppercase tracking-[0.08em] text-gray-600 dark:text-gray-400">
            {formattedDate}
          </time>
          <Badge variant={categoryColors[String(post.category).toLowerCase()] ?? 'default'}>
            {categoryLabel(post.category)}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.015em] text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-[0.95rem] leading-relaxed text-gray-700 dark:text-gray-300 line-clamp-3">
          {post.description}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="chip">
                #{tag}
              </li>
            ))}
          </ul>
        )}

        {/* Read More */}
        <div className="mt-auto pt-1 font-mono text-xs text-primary-700 dark:text-primary-400">
          Read the article <span aria-hidden="true">→</span>
        </div>
      </article>
    </Link>
  )
}
