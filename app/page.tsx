import LandingHero from '@/components/home/LandingHero'
import ProductShowcase from '@/components/products/ProductShowcase'
import AboutSection from '@/components/home/AboutSection'
import NewsletterCTA from '@/components/home/NewsletterCTA'
import BlogPostsSection from '@/components/home/BlogPostsSection'
import { getAllPosts, getFeaturedPosts } from '@/lib/mdx'

export default function Home() {
  const allPosts = getAllPosts()
  const featuredPosts = getFeaturedPosts().slice(0, 2)

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
