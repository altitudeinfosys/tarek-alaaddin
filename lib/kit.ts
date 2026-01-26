/**
 * Kit (ConvertKit) Integration
 *
 * This module provides functions to interact with Kit's API for newsletter subscriptions.
 * It uses environment variables for API authentication.
 */

const KIT_API_KEY = process.env.KIT_API_KEY
const KIT_API_BASE_URL = process.env.KIT_API_BASE_URL || 'https://api.kit.com/v4'

if (!KIT_API_KEY) {
  console.warn('KIT_API_KEY is not set. Kit integration will not work.')
}

export interface SubscribeParams {
  email: string
  firstName?: string
  topics: {
    productivity: boolean
    ai: boolean
    marketing: boolean
  }
}

export interface KitResponse {
  success: boolean
  subscriberId?: string
  error?: string
}

/**
 * Subscribe a user to the newsletter with topic preferences
 */
export async function subscribeToNewsletter(params: SubscribeParams): Promise<KitResponse> {
  if (!KIT_API_KEY) {
    return {
      success: false,
      error: 'Kit API is not configured',
    }
  }

  try {
    // Create subscriber
    const subscriberResponse = await fetch(`${KIT_API_BASE_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIT_API_KEY}`,
      },
      body: JSON.stringify({
        email_address: params.email,
        first_name: params.firstName || '',
        state: 'active',
        fields: {
          topic_productivity: params.topics.productivity ? 'true' : 'false',
          topic_ai: params.topics.ai ? 'true' : 'false',
          topic_marketing: params.topics.marketing ? 'true' : 'false',
        },
      }),
    })

    if (!subscriberResponse.ok) {
      const errorData = await subscriberResponse.json().catch(() => ({}))
      throw new Error(errorData.message || `Kit API error: ${subscriberResponse.status}`)
    }

    const data = await subscriberResponse.json()
    const subscriberId = data.subscriber?.id

    // Add tags based on selected topics
    if (subscriberId) {
      const tagPromises = []

      // Add lead magnet tag (everyone gets this)
      tagPromises.push(
        addTagToSubscriber(subscriberId, 'lead-magnet-productivity-stack')
      )

      // Add topic-specific tags
      if (params.topics.productivity) {
        tagPromises.push(addTagToSubscriber(subscriberId, 'interest-productivity'))
      }
      if (params.topics.ai) {
        tagPromises.push(addTagToSubscriber(subscriberId, 'interest-ai'))
      }
      if (params.topics.marketing) {
        tagPromises.push(addTagToSubscriber(subscriberId, 'interest-marketing'))
      }

      // Wait for all tags to be added (but don't fail if tagging fails)
      await Promise.allSettled(tagPromises)
    }

    return {
      success: true,
      subscriberId,
    }
  } catch (error) {
    console.error('Kit subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to subscribe',
    }
  }
}

/**
 * Add a tag to a subscriber
 */
async function addTagToSubscriber(subscriberId: string, tagName: string): Promise<void> {
  // First, get or create the tag
  const tagsResponse = await fetch(`${KIT_API_BASE_URL}/tags`, {
    headers: {
      'Authorization': `Bearer ${KIT_API_KEY}`,
    },
  })

  if (!tagsResponse.ok) {
    throw new Error('Failed to fetch tags')
  }

  const tagsData = await tagsResponse.json()
  let tagId = tagsData.tags?.find((t: any) => t.name === tagName)?.id

  // Create tag if it doesn't exist
  if (!tagId) {
    const createTagResponse = await fetch(`${KIT_API_BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIT_API_KEY}`,
      },
      body: JSON.stringify({ name: tagName }),
    })

    if (createTagResponse.ok) {
      const createTagData = await createTagResponse.json()
      tagId = createTagData.tag?.id
    }
  }

  // Add tag to subscriber
  if (tagId) {
    await fetch(`${KIT_API_BASE_URL}/subscribers/${subscriberId}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIT_API_KEY}`,
      },
      body: JSON.stringify({ tag_id: tagId }),
    })
  }
}
