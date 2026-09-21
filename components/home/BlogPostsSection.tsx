import Link from 'next/link'
import { BlogPostMeta } from '@/types/blog'
import { categoryLabel } from '@/lib/categories'

interface BlogPostsSectionProps {
  posts: BlogPostMeta[]
  totalCount: number
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

// One row of the latest posts. Its job is to show the writing is current,
// not to be a full index — that's /blog.
export default function BlogPostsSection({ posts, totalCount }: BlogPostsSectionProps) {
  if (posts.length === 0) return null

  return (
    <section id="writing" className="band band-grey">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow eyebrow-accent mb-2.5">Recent thinking</div>
            <h2 className="h-section">Writing in public, every week.</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl">
              Practical notes on AI tooling, engineering judgment, and building software that lasts.
            </p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            All {totalCount} articles →
          </Link>
        </div>

        <div className="thin-grid md:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group thin-cell">
              <span className="font-mono text-[0.69rem] uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
                {formatDate(post.date)} · {categoryLabel(post.category)}
              </span>
              <h3 className="font-display text-lg font-bold leading-snug tracking-[-0.015em] text-gray-900 dark:text-white">
                {post.title}
              </h3>
              <span className="mt-auto flex items-center justify-between rounded-[5px] border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 font-mono text-xs text-gray-900 dark:text-gray-100 transition-colors group-hover:border-primary-600 group-hover:text-primary-600 dark:group-hover:border-primary-400 dark:group-hover:text-primary-400">
                Read the article <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
