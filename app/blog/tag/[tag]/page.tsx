import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import BlogCard from '@/components/blog/BlogCard'
import { getAllTagsWithCounts, getPostsByTag } from '@/lib/mdx'
import { absoluteUrl } from '@/lib/site'
import { BreadcrumbSchema } from '@/components/JsonLd'

interface TagPageProps {
  params: { tag: string }
}

// Only tags on ≥ 2 posts get a prerendered archive page; one-post tags would
// duplicate the post itself and dilute the index.
export function generateStaticParams() {
  return getAllTagsWithCounts(2).map(({ tag }) => ({ tag }))
}

// Human-friendly label for a tag slug ("ai-agents" → "AI Agents"). Short
// alt forms are capitalized specially so they don't look wrong in the H1.
const SPECIAL_CASE: Record<string, string> = {
  ai: 'AI',
  llm: 'LLM',
  cli: 'CLI',
  api: 'API',
  'ui-ux': 'UI/UX',
  nextjs: 'Next.js',
  'next-js': 'Next.js',
  openai: 'OpenAI',
  xai: 'xAI',
  seo: 'SEO',
  rss: 'RSS',
  saas: 'SaaS',
}

function tagLabel(tag: string): string {
  const key = tag.toLowerCase()
  if (SPECIAL_CASE[key]) return SPECIAL_CASE[key]
  return key
    .split('-')
    .map((part) => (SPECIAL_CASE[part] ?? part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ')
}

export function generateMetadata({ params }: TagPageProps): Metadata {
  const tag = params.tag.toLowerCase()
  const label = tagLabel(tag)
  const title = `Posts tagged "${label}" | Tarek Alaaddin`
  const description = `Posts on ${label} from Tarek Alaaddin's blog — AI engineering, developer workflows, and shipping real products.`
  const url = absoluteUrl(`/blog/tag/${tag}`)
  const postCount = getPostsByTag(tag).length

  return {
    title,
    description,
    alternates: { canonical: url },
    // A tag that appears on a single post would be a near-duplicate of that
    // post and dilute the site's index. Keep the page live for navigation,
    // but noindex it so it stays out of search results.
    robots:
      postCount >= 2
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tarek Alaaddin',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function TagPage({ params }: TagPageProps) {
  const tag = params.tag.toLowerCase()
  const posts = getPostsByTag(tag)
  if (posts.length === 0) notFound()

  const label = tagLabel(tag)

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Blog', path: '/blog' },
          { name: `#${label}`, path: `/blog/tag/${tag}` },
        ]}
      />
      <div className="max-w-[76rem] mx-auto py-14 md:py-[4.5rem] px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link
            href="/blog"
            className="inline-flex items-center font-mono text-xs uppercase tracking-[0.08em] text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 mb-6"
          >
            <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All posts
          </Link>
          <div className="eyebrow eyebrow-accent mb-3">Tag</div>
          <h1 className="font-display font-bold tracking-[-0.035em] leading-[1.02] text-[2.5rem] sm:text-6xl text-gray-900 dark:text-white mb-4">
            #{label}
          </h1>
          <p className="text-[1.15rem] text-gray-700 dark:text-gray-300 max-w-2xl">
            Every post tagged <span className="font-mono">#{tag}</span>.
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-gray-600 dark:text-gray-400 mt-4">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
