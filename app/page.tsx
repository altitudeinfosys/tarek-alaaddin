import LandingHero from '@/components/home/LandingHero'
import ProductShowcase from '@/components/products/ProductShowcase'
import AboutSection from '@/components/home/AboutSection'
import NewsletterCTA from '@/components/home/NewsletterCTA'
import BlogPostsSection from '@/components/home/BlogPostsSection'
import { getAllPosts, getFeaturedPosts } from '@/lib/mdx'
import { BlogPostMeta } from '@/types/blog'

export default function Home() {
  let allPosts: BlogPostMeta[] = []
  let featuredPosts: BlogPostMeta[] = []

  try {
    allPosts = getAllPosts()
    featuredPosts = getFeaturedPosts().slice(0, 2)
  } catch (error) {
    console.error('Failed to load blog posts:', error)
    // Fall back to empty arrays - page will still render without blog section
  }

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <LandingHero />

      {/* Newsletter CTA */}
      <NewsletterCTA />

      {/* Blog Posts Section */}
      <BlogPostsSection allPosts={allPosts} featuredPosts={featuredPosts} />

      {/* Products Showcase */}
      <ProductShowcase />

      {/* About Section */}
      <AboutSection />
    </main>
  )
}
