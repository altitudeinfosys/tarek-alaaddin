interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export default function JsonLd({ data }: JsonLdProps) {
  // JSON-LD requires dangerouslySetInnerHTML — content is safe because
  // it's JSON.stringify of developer-controlled objects, not user input.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function PersonSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': 'https://tarekalaaddin.com/#person',
        name: 'Tarek Alaaddin',
        url: 'https://tarekalaaddin.com',
        description:
          'Software engineer with expertise in backend development, cloud architecture, and full-stack applications. Creator of Taskitos and ExpandNote.',
        jobTitle: 'Software Engineer & Product Builder',
        knowsAbout: [
          'Software Engineering',
          'Backend Development',
          'Cloud Architecture',
          'Full-Stack Development',
          'Artificial Intelligence',
          'SaaS Products',
        ],
        sameAs: [
          'https://www.linkedin.com/in/tarekalaaddin',
          'https://github.com/altitudeinfosys',
          'https://x.com/tarekalaaddin',
        ],
      }}
    />
  )
}

export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': 'https://tarekalaaddin.com/#website',
        name: 'Tarek Alaaddin',
        url: 'https://tarekalaaddin.com',
        description:
          'Software engineer with expertise in backend development, cloud architecture, and full-stack applications.',
        publisher: { '@id': 'https://tarekalaaddin.com/#person' },
        inLanguage: 'en-US',
      }}
    />
  )
}

interface BlogPostingSchemaProps {
  title: string
  description: string
  slug: string
  date: string
  tags: string[]
  category: string
}

export function BlogPostingSchema({
  title,
  description,
  slug,
  date,
  tags,
  category,
}: BlogPostingSchemaProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        url: `https://tarekalaaddin.com/blog/${slug}`,
        datePublished: date,
        dateModified: date,
        articleSection: category,
        keywords: tags.join(', '),
        inLanguage: 'en-US',
        author: { '@id': 'https://tarekalaaddin.com/#person' },
        publisher: { '@id': 'https://tarekalaaddin.com/#person' },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://tarekalaaddin.com/blog/${slug}`,
        },
      }}
    />
  )
}
