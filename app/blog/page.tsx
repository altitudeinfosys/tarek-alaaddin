import { getAllPosts } from '@/lib/mdx'
import BlogClientWrapper from '@/components/blog/BlogClientWrapper'
import { absoluteUrl } from '@/lib/site'

export const metadata = {
  title: 'Blog | Tarek Alaaddin',
  description: 'Insights on productivity, AI tools, software engineering, and building SaaS products',
  alternates: {
    canonical: absoluteUrl('/blog'),
  },
  openGraph: {
    title: 'Blog | Tarek Alaaddin',
    description: 'Insights on productivity, AI tools, software engineering, and building SaaS products',
    url: absoluteUrl('/blog'),
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
}

export default function BlogPage() {
  const allPosts = getAllPosts()

  return <BlogClientWrapper posts={allPosts} />
}
