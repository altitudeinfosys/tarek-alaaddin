import { Product } from '@/types/products'

export const products: Product[] = [
  {
    id: 'taskitos',
    name: 'Taskitos',
    tagline: 'Never Miss a Task Ever Again',
    description: 'AI-powered task manager with persistent reminders that actively ensures task completion.',
    fullDescription: 'Unlike passive task apps, Taskitos uses intelligent persistent nagging, automatic rescheduling, and AI-enhanced task capture to keep you accountable and productive. Built on behavioral science principles including Temporal Motivation Theory and Implementation Intentions.',
    features: [
      'Smart Persistent Nagging - escalating reminders that actually work',
      'Voice-to-Task - create tasks using natural language or voice recordings',
      'AI Task Parsing - intelligent understanding of your task intent',
      'Overwhelm Recovery - AI detects when you\'re stuck and helps you recover',
      'Auto-Rescheduling - smart task rescheduling based on completion patterns',
      'Extreme Focus Mode - limit yourself to 3 priority tasks at a time',
      'Beautiful Email Actions - complete or snooze tasks directly from email',
      'Quiet Hours - respects your sleep schedule',
    ],
    status: {
      web: '✅ Live',
      ios: '🚧 Coming Soon',
      android: '🚧 Coming Soon',
    },
    links: {
      web: 'https://taskitos.com',
    },
    images: [
      '/images/products/taskitos-logo.png',
    ],
    technologies: [
      'Next.js 15',
      'React Native',
      'Supabase',
      'OpenAI (GPT-4o-mini, Whisper)',
      'Tailwind CSS',
    ],
    pricing: {
      free: 'Basic - 10 AI uses/month',
      pro: 'Pro - $3.99/mo or $29.99/yr - Unlimited AI, all features',
    },
  },
  {
    id: 'expandnote',
    name: 'ExpandNote',
    tagline: 'Your Notes, Supercharged by AI',
    description: 'AI-powered cross-platform note-taking app that thinks with you.',
    fullDescription: 'ExpandNote combines intelligent automation, voice-to-text input, and seamless synchronization. The core innovation is the AI Profiles system—user-configured automation rules that execute AI prompts when specific tags are applied to notes. Work offline-first with real-time sync across all devices.',
    features: [
      'AI Profiles - automate content processing with custom AI prompts',
      'Voice to Text - create notes using voice input powered by OpenAI Whisper',
      'Smart Tagging - AI-powered tag suggestions based on content',
      'Email-to-Note - convert emails with attachments directly into notes',
      'Offline-First - work seamlessly offline with automatic sync',
      'Markdown Support - rich text formatting with live preview',
      'Multi-Model AI - supports OpenAI, Claude, and 40+ AI models via OpenRouter',
      'Real-time Sync - cross-device synchronization with conflict resolution',
    ],
    status: {
      web: '✅ Live',
      ios: '🚧 Preview Builds Available',
      android: '🚧 Preview Builds Available',
    },
    links: {
      web: 'https://expandnote.com',
      github: 'https://github.com/altitudeinfosys/ExpandNote',
    },
    images: [
      '/images/products/expandnote-logo.svg',
    ],
    technologies: [
      'Next.js 16',
      'React Native (Expo)',
      'Supabase',
      'OpenAI & Claude APIs',
      'Tailwind CSS',
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getAllProducts(): Product[] {
  return products
}
