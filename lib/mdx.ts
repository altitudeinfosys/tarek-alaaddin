import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { BlogPost, BlogPostMeta } from '@/types/blog'

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
 * Get featured posts
 */
export function getFeaturedPosts(): BlogPostMeta[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) => post.featured)
}
