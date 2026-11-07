import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import BlogCard from '@/components/blog/BlogCard'
import { getPostsByCategoryGroup } from '@/lib/mdx'
import { categoryLabel } from '@/lib/categories'
import { absoluteUrl } from '@/lib/site'
import { BreadcrumbSchema } from '@/components/JsonLd'

const CATEGORY_GROUPS = ['ai', 'productivity', 'development'] as const
type CategoryGroup = (typeof CATEGORY_GROUPS)[number]

const CATEGORY_DESCRIPTIONS: Record<CategoryGroup, string> = {
  ai: 'Posts on AI engineering, agent systems, and the shifting frontier of AI tools and policy.',
  productivity: 'Posts on habits, workflows, and systems for getting more done without burning out.',
  development: 'Posts on software engineering, developer tools, backend systems, and security.',
}

interface CategoryPageProps {
  params: { category: string }
}

export function generateStaticParams() {
  return CATEGORY_GROUPS.map((category) => ({ category }))
}

function resolveCategory(raw: string): CategoryGroup | null {
  const key = raw.trim().toLowerCase()
  return (CATEGORY_GROUPS as readonly string[]).includes(key) ? (key as CategoryGroup) : null
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const group = resolveCategory(params.category)
  if (!group) return { title: 'Category Not Found' }

  const label = categoryLabel(group)
  const title = `${label} posts | Tarek Alaaddin`
  const description = CATEGORY_DESCRIPTIONS[group]
  const url = absoluteUrl(`/blog/category/${group}`)

  return {
    title,
    description,
    alternates: { canonical: url },
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

export default function CategoryPage({ params }: CategoryPageProps) {
  const group = resolveCategory(params.category)
  if (!group) notFound()

  const posts = getPostsByCategoryGroup(group)
  if (posts.length === 0) notFound()

  const label = categoryLabel(group)

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: 'Blog', path: '/blog' },
          { name: label, path: `/blog/category/${group}` },
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
          <div className="eyebrow eyebrow-accent mb-3">Category</div>
          <h1 className="font-display font-bold tracking-[-0.035em] leading-[1.02] text-[2.5rem] sm:text-6xl text-gray-900 dark:text-white mb-4">
            {label}
          </h1>
          <p className="text-[1.15rem] text-gray-700 dark:text-gray-300 max-w-2xl">
            {CATEGORY_DESCRIPTIONS[group]}
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
