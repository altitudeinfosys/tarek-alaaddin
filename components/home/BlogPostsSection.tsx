import { BlogPostMeta } from '@/types/blog'
import BlogCard from '@/components/blog/BlogCard'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import CategoryFilter from './CategoryFilter'

interface BlogPostsSectionProps {
  allPosts: BlogPostMeta[]
  featuredPosts: BlogPostMeta[]
}

export default function BlogPostsSection({ allPosts, featuredPosts }: BlogPostsSectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Featured Posts — Server-rendered for AI crawler visibility */}
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

          {/* Category filter is client-side for interactivity */}
          <CategoryFilter posts={allPosts} />

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
