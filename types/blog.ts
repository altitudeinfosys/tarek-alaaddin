export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
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
  category: 'ai' | 'productivity' | 'development'
  tags: string[]
  image?: string
  featured: boolean
}
