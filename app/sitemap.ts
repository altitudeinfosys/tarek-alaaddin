import { MetadataRoute } from 'next'
import { getAllPosts, getAllTagsWithCounts, getPostsByCategoryGroup } from '@/lib/mdx'
import { absoluteUrl } from '@/lib/site'

const CATEGORY_GROUPS = ['ai', 'productivity', 'development'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  const blogEntries = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    // Prefer the post's explicit `updated` date when present, otherwise
    // fall back to the publish date.
    lastModified: new Date(post.updated || post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Newest post date — home and /blog change when a post ships; the rest carry no date
  const latest = posts.length ? new Date(posts[0].date) : undefined

  const staticPages = [
    { url: absoluteUrl(), lastModified: latest, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: absoluteUrl('/blog'), lastModified: latest, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: absoluteUrl('/videos'), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: absoluteUrl('/products'), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: absoluteUrl('/resume'), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: absoluteUrl('/subscribe'), changeFrequency: 'yearly' as const, priority: 0.5 },
  ]

  const categoryEntries = CATEGORY_GROUPS.flatMap((group) => {
    const groupPosts = getPostsByCategoryGroup(group)
    if (groupPosts.length === 0) return []
    const newest = groupPosts[0]
    return [
      {
        url: absoluteUrl(`/blog/category/${group}`),
        lastModified: new Date(newest.updated || newest.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ]
  })

  // Only tag archives with at least two posts are indexable; see the tag
  // page's robots config for the reasoning.
  const tagEntries = getAllTagsWithCounts(2).map(({ tag }) => ({
    url: absoluteUrl(`/blog/tag/${tag}`),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...categoryEntries, ...tagEntries, ...blogEntries]
}
