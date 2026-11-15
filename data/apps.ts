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
    url: 'https://saycopy.app',
  },
  {
    id: 'propertypulse360',
    name: 'PropertyPulse360',
    tagline: 'Property management made simple — rent collection, expense tracking, and owner reporting with AI-parsed email ingestion.',
    platforms: 'Web',
    url: 'https://www.propertypulse360.com',
  },
  {
    id: 'textinvoicego',
    name: 'TextInvoiceGo',
    tagline: 'Text or call in the job, get the invoice before you drive off — an AI voice and SMS agent drafts it for tradespeople.',
    platforms: 'SMS · Voice · Web',
    url: 'https://speakinvoicego.com',
  },
  {
    id: 'ackpush',
    name: 'AckPush',
    tagline: 'Push notifications for apps and AI agents that you answer from the lock screen — buttons, typed replies, snooze.',
    platforms: 'iOS · Android · Web · Early access',
    url: 'https://ackpush.com',
  },
]

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

/** How many apps, as a word ("six"), so copy stays in step with the list. */
export const appCountWord = NUMBER_WORDS[apps.length] ?? String(apps.length)
