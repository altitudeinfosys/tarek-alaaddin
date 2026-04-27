import { Feed } from 'feed'
import { getAllPosts } from '@/lib/mdx'
import { SITE_URL } from '@/lib/site'
const AUTHOR = {
  name: 'Tarek Alaaddin',
  link: SITE_URL,
}

export const dynamic = 'force-static'

export async function GET() {
  const posts = getAllPosts()

  const feed = new Feed({
    title: 'Tarek Alaaddin — Blog',
    description:
      'Insights on productivity, AI tools, software engineering, and building SaaS products.',
    id: `${SITE_URL}/blog`,
    link: `${SITE_URL}/blog`,
    language: 'en',
    copyright: `All rights reserved ${new Date().getFullYear()}, Tarek Alaaddin`,
    updated: posts[0]?.date ? new Date(posts[0].date) : new Date(),
    generator: 'Next.js + feed',
    feedLinks: {
      rss2: `${SITE_URL}/feed.xml`,
    },
    author: AUTHOR,
  })

  for (const post of posts) {
    const url = `${SITE_URL}/blog/${post.slug}`
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      date: new Date(post.date),
      category: (post.tags || []).map((tag) => ({ name: tag })),
      author: [AUTHOR],
      image: post.image ? `${SITE_URL}${post.image}` : undefined,
    })
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
