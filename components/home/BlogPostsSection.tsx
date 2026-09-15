import { BlogPostMeta } from '@/types/blog'
import BlogCard from '@/components/blog/BlogCard'
import Button from '@/components/ui/Button'

interface BlogPostsSectionProps {
  posts: BlogPostMeta[]
  totalCount: number
}

// One row of the latest posts. Its job is to show the writing is current,
// not to be a full index — that's /blog.
export default function BlogPostsSection({ posts, totalCount }: BlogPostsSectionProps) {
  if (posts.length === 0) return null

  return (
    <section id="writing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
              Recent thinking
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-balance">
              Writing in public, every week.
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-2xl">
              Practical notes on AI tooling, engineering judgment, and building software that lasts.
            </p>
          </div>
          <Button href="/blog" variant="outline" size="md">
            All {totalCount} articles
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
