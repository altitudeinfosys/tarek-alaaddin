export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  // Optional ISO date set when the post is edited after publication. Used for
  // Schema.org dateModified and the article:modified_time OG tag; absent means
  // the post hasn't been edited since it went live.
  updated?: string
  category: 'ai' | 'productivity' | 'development'
  tags: string[]
  image?: string
  published: boolean
  featured: boolean
  content: string
}

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  category: 'ai' | 'productivity' | 'development'
  tags: string[]
  image?: string
  featured: boolean
}
