import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/mdx'
import { absoluteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  const blogEntries = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const staticPages = [
    { url: absoluteUrl(), lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: absoluteUrl('/blog'), lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: absoluteUrl('/products'), lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: absoluteUrl('/resume'), lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: absoluteUrl('/contact'), lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: absoluteUrl('/subscribe'), lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
  ]

  return [...staticPages, ...blogEntries]
}
