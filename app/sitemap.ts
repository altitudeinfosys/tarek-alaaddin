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

  // Newest post date — home and /blog change when a post ships; the rest carry no date
  const latest = posts.length ? new Date(posts[0].date) : undefined

  const staticPages = [
    { url: absoluteUrl(), lastModified: latest, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: absoluteUrl('/blog'), lastModified: latest, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: absoluteUrl('/products'), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: absoluteUrl('/resume'), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: absoluteUrl('/subscribe'), changeFrequency: 'yearly' as const, priority: 0.5 },
  ]

  return [...staticPages, ...blogEntries]
}
