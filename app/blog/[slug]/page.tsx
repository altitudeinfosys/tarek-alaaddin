import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPostBySlug, getAllPostSlugs } from '@/lib/mdx'
import Callout from '@/components/mdx/Callout'
import CodeBlock from '@/components/mdx/CodeBlock'
import ProductCTA from '@/components/mdx/ProductCTA'
import ImageWithCaption from '@/components/mdx/ImageWithCaption'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Link from 'next/link'
import { categoryLabel } from '@/lib/categories'
import Badge from '@/components/ui/Badge'
import { BlogPostingSchema } from '@/components/JsonLd'
import { absoluteUrl } from '@/lib/site'

interface BlogPostPageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const url = absoluteUrl(`/blog/${params.slug}`)

  return {
    title: `${post.title} | Tarek Alaaddin`,
    description: post.description,
    keywords: post.tags,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'Tarek Alaaddin',
      locale: 'en_US',
      type: 'article',
      publishedTime: post.date,
      authors: ['Tarek Alaaddin'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

const components = {
  Callout,
  CodeBlock,
  ProductCTA,
  ImageWithCaption,
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)

  if (!post || !post.published) {
    notFound()
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  const categoryColors = {
    ai: 'info' as const,
    productivity: 'success' as const,
    development: 'default' as const,
  }

  const categoryVariant = categoryColors[post.category as keyof typeof categoryColors] || 'default'

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <BlogPostingSchema
        title={post.title}
        description={post.description}
        slug={params.slug}
        date={post.date}
        tags={post.tags}
        category={post.category}
      />
      <article className="max-w-4xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 pb-10 border-b border-gray-300 dark:border-gray-800">
          <Link
            href="/blog"
            className="inline-flex items-center font-mono text-xs uppercase tracking-[0.08em] text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 mb-8"
          >
            <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to blog
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <time className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-gray-600 dark:text-gray-400">
              {formattedDate}
            </time>
            <Badge variant={categoryVariant}>
              {categoryLabel(post.category)}
            </Badge>
          </div>

          <h1 className="font-display font-bold tracking-[-0.03em] leading-[1.05] text-4xl md:text-[3.25rem] text-gray-900 dark:text-white text-balance mb-6">
            {post.title}
          </h1>

          <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
            {post.description}
          </p>

          {post.tags && post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 mt-6">
              {post.tags.map((tag) => (
                <li key={tag} className="chip">
                  #{tag}
                </li>
              ))}
            </ul>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-[-0.02em] [&_:is(h2,h3,h4)>a]:font-bold [&_:is(h2,h3,h4)>a]:text-inherit [&_:is(h2,h3,h4)>a]:no-underline hover:[&_:is(h2,h3,h4)>a]:underline">
          <MDXRemote
            source={post.content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeHighlight,
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                ],
              },
            }}
          />
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/blog"
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              ← Back to all posts
            </Link>
            <Link
              href="/subscribe"
              className="btn-flat btn-flat-primary"
            >
              Subscribe to the newsletter
            </Link>
          </div>
        </footer>
      </article>
    </div>
  )
}
