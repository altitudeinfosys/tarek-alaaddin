import LandingHero from '@/components/home/LandingHero'
import WhatIBring from '@/components/home/WhatIBring'
import FitCheckSection from '@/components/home/FitCheckSection'
import BlogPostsSection from '@/components/home/BlogPostsSection'
import AppsGrid from '@/components/home/AppsGrid'
import AboutSection from '@/components/home/AboutSection'
import ContactCTA from '@/components/home/ContactCTA'
import { getAllPosts } from '@/lib/mdx'
import { apps } from '@/data/apps'
import { BlogPostMeta } from '@/types/blog'

export default function Home() {
  let allPosts: BlogPostMeta[] = []

  try {
    allPosts = getAllPosts()
  } catch (error) {
    console.error('Failed to load blog posts:', error)
    // Fall back to an empty list - page still renders without the writing section
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <LandingHero postCount={allPosts.length} appCount={apps.length} />
      <WhatIBring />
      <FitCheckSection />
      <BlogPostsSection posts={allPosts.slice(0, 3)} totalCount={allPosts.length} />
      <AppsGrid />
      <AboutSection />
      <ContactCTA />
    </div>
  )
}
