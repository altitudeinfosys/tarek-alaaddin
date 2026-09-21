// Display labels for blog categories. Frontmatter uses several spellings
// (ai, ai-tools, "AI Tools", Productivity…); this normalizes what readers see
// without touching the posts or the BlogPost type.

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI',
  'ai-tools': 'AI Tools',
  'ai-industry': 'AI Industry',
  'ai-strategy': 'AI Strategy',
  productivity: 'Productivity',
  development: 'Development',
  'developer-tools': 'Developer Tools',
  backend: 'Backend',
  security: 'Security',
}

// The blog has three filter buttons but posts use many category spellings.
// Map each one onto a filter so no post is unreachable.
const CATEGORY_GROUPS: Record<string, 'ai' | 'productivity' | 'development'> = {
  productivity: 'productivity',
  development: 'development',
  'developer-tools': 'development',
  backend: 'development',
  security: 'development',
}

export function categoryGroup(category: string): 'ai' | 'productivity' | 'development' {
  const key = category.trim().toLowerCase().replace(/\s+/g, '-')
  if (key === 'ai' || key.startsWith('ai-')) return 'ai'
  return CATEGORY_GROUPS[key] ?? 'development'
}

export function categoryLabel(category: string): string {
  const key = category.trim().toLowerCase().replace(/\s+/g, '-')
  return CATEGORY_LABELS[key] ?? category
}
