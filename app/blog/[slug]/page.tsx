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
import Badge from '@/components/ui/Badge'

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

  const url = `https://tarekalaaddin.com/blog/${params.slug}`

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
      <article className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant={categoryVariant}>
              {post.category}
            </Badge>
            <time className="text-gray-500 dark:text-gray-400">
              {formattedDate}
            </time>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300">
            {post.description}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
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
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              ← Back to all posts
            </Link>
            <Link
              href="/subscribe"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Subscribe to Newsletter
            </Link>
          </div>
        </footer>
      </article>
    </div>
  )
}
