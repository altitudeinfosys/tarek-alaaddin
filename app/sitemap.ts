import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/mdx'

const BASE_URL = 'https://tarekalaaddin.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  const blogEntries = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/resume`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${BASE_URL}/subscribe`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
  ]

  return [...staticPages, ...blogEntries]
}
