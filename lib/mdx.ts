import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { BlogPost, BlogPostMeta } from '@/types/blog'
import { categoryGroup } from '@/lib/categories'

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content/blog')

/**
 * Get all blog post slugs
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return []
  }

  const files = fs.readdirSync(BLOG_CONTENT_DIR)
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

/**
 * Get a blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      updated: data.updated || undefined,
      category: data.category || 'development',
      tags: data.tags || [],
      image: data.image,
      published: data.published !== false, // default to true
      featured: data.featured || false,
      content,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

/**
 * Get all blog posts (metadata only)
 */
export function getAllPosts(): BlogPostMeta[] {
  const slugs = getAllPostSlugs()
  const posts: BlogPostMeta[] = []

  for (const slug of slugs) {
    const post = getPostBySlug(slug)
    if (!post || !post.published) {
      continue
    }

    posts.push({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      updated: post.updated,
      category: post.category,
      tags: post.tags,
      image: post.image,
      featured: post.featured,
    })
  }

  // Sort by date (newest first)
  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: string): BlogPostMeta[] {
  const allPosts = getAllPosts()
  if (category === 'all') {
    return allPosts
  }
  return allPosts.filter((post) => post.category === category)
}

/**
 * Posts in a top-level category group (ai, productivity, development).
 * Uses categoryGroup() so posts tagged as "ai-tools", "ai-industry",
 * "backend", "security", etc. roll up into the right archive.
 */
export function getPostsByCategoryGroup(
  group: 'ai' | 'productivity' | 'development'
): BlogPostMeta[] {
  return getAllPosts().filter((post) => categoryGroup(post.category) === group)
}

/**
 * Get posts related to a given post: ranked by shared tags, then same
 * category, then newest first. Always fills `limit` slots when enough posts exist.
 */
export function getRelatedPosts(
  post: Pick<BlogPostMeta, 'slug' | 'category' | 'tags'>,
  limit = 3
): BlogPostMeta[] {
  const tags = new Set(post.tags.map((tag) => tag.toLowerCase()))

  const score = (other: BlogPostMeta) =>
    other.tags.filter((tag) => tags.has(tag.toLowerCase())).length * 3 +
    (other.category === post.category ? 1 : 0)

  // getAllPosts is newest-first and Array.sort is stable, so ties keep date order
  return getAllPosts()
    .filter((other) => other.slug !== post.slug)
    .map((other) => ({ other, score: score(other) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ other }) => other)
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(): BlogPostMeta[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) => post.featured)
}

/**
 * Get posts that carry a given tag (case-insensitive match).
 */
export function getPostsByTag(tag: string): BlogPostMeta[] {
  const normalized = tag.trim().toLowerCase()
  return getAllPosts().filter((post) =>
    post.tags.some((postTag) => postTag.toLowerCase() === normalized)
  )
}

/**
 * Tags that appear on at least `minPostCount` posts, with their post counts.
 * Single-post tags are excluded by default so each tag archive is a real
 * index rather than a near-duplicate of a single post.
 */
export function getAllTagsWithCounts(minPostCount = 2): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      const key = tag.trim().toLowerCase()
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count >= minPostCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}
