import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const OUTPUT_PATH = path.join(process.cwd(), 'public/search-index.json')

function stripMdx(content) {
  return content
    // Remove JSX self-closing tags: <Component ... />
    .replace(/<[A-Z][a-zA-Z]*\s[^>]*\/>/g, '')
    // Remove JSX opening tags: <Component ...>
    .replace(/<[A-Z][a-zA-Z]*(?:\s[^>]*)?>/g, '')
    // Remove JSX closing tags: </Component>
    .replace(/<\/[A-Z][a-zA-Z]*>/g, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove markdown images
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // Convert markdown links to just text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Remove code fence markers (keep content between them)
    .replace(/```[a-z]*/g, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Collapse whitespace
    .replace(/\n{2,}/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function generateSearchIndex() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log('No blog directory found, skipping search index generation')
    fs.writeFileSync(OUTPUT_PATH, '[]')
    return
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
  const index = []

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
      const { data, content } = matter(raw)

      if (data.published === false) continue

      index.push({
        slug: file.replace(/\.mdx$/, ''),
        title: data.title || '',
        description: data.description || '',
        tags: (data.tags || []).join(' '),
        category: data.category || '',
        body: stripMdx(content),
      })
    } catch (err) {
      console.warn(`Skipping ${file}: ${err.message}`)
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index))
  console.log(`Search index generated: ${index.length} posts`)
}

generateSearchIndex()
