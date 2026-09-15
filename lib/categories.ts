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
}

export function categoryLabel(category: string): string {
  const key = category.trim().toLowerCase().replace(/\s+/g, '-')
  return CATEGORY_LABELS[key] ?? category
}
