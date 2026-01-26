import { getAllPosts } from '@/lib/mdx'
import BlogCard from '@/components/blog/BlogCard'
import BlogClientWrapper from '@/components/blog/BlogClientWrapper'

export const metadata = {
  title: 'Blog | Tarek Alaaddin',
  description: 'Insights on productivity, AI tools, software engineering, and building SaaS products',
  openGraph: {
    title: 'Blog | Tarek Alaaddin',
    description: 'Insights on productivity, AI tools, software engineering, and building SaaS products',
    url: 'https://tarekalaaddin.com/blog',
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
}

export default function BlogPage() {
  const allPosts = getAllPosts()

  return <BlogClientWrapper posts={allPosts} />
}
