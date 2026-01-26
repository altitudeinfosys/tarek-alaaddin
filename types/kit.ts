export interface NewsletterSubscription {
  email: string
  firstName?: string
  topics: {
    productivity: boolean
    ai: boolean
    marketing: boolean
  }
}

export interface KitSubscriber {
  id: string
  email_address: string
  first_name?: string
  state: 'active' | 'inactive'
  created_at: string
}

export interface KitTag {
  id: string
  name: string
}
