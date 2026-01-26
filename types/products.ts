export interface ProductStatus {
  web: string
  ios: string
  android: string
}

export interface ProductLinks {
  web?: string
  waitlist?: string
  github?: string
}

export interface Product {
  id: string
  name: string
  tagline: string
  description: string
  fullDescription: string
  features: string[]
  status: ProductStatus
  links: ProductLinks
  images: string[]
  technologies: string[]
  pricing?: {
    free?: string
    pro?: string
  }
}
