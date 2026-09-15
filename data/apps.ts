// Shipped apps shown in the homepage grid. Kept separate from data/products.ts,
// which drives the /products detail pages and requires fuller fields.

export interface ShippedApp {
  id: string
  name: string
  tagline: string
  platforms: string
  url: string
}

export const apps: ShippedApp[] = [
  {
    id: 'taskitos',
    name: 'Taskitos',
    tagline: 'AI task manager that won\'t let you miss what matters — voice-to-task, persistent reminders.',
    platforms: 'Web · iOS · Android',
    url: 'https://taskitos.com',
  },
  {
    id: 'expandnote',
    name: 'ExpandNote',
    tagline: 'AI-powered notes — capture, organize, and transform across devices with automation profiles.',
    platforms: 'Web · iOS · Android',
    url: 'https://expandnote.com',
  },
  {
    id: 'saycopy',
    name: 'SayCopy',
    tagline: 'Voice to text, ready to use — transcribe, translate (EN/ES/AR), clean up, copy anywhere. Private by design.',
    platforms: 'iOS · Android',
    url: 'https://apps.apple.com/us/app/saycopy/id6790925849',
  },
  {
    id: 'propertypulse360',
    name: 'PropertyPulse360',
    tagline: 'Property management made simple — rent collection, expense tracking, and owner reporting with AI-parsed email ingestion.',
    platforms: 'Web',
    url: 'https://www.propertypulse360.com',
  },
]
