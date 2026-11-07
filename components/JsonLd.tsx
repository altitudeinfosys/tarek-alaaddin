import { absoluteUrl } from '@/lib/site'

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export default function JsonLd({ data }: JsonLdProps) {
  // JSON-LD requires dangerouslySetInnerHTML. Video titles come from the YouTube
  // API, so "<" is escaped to stop any text from closing the script tag.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

export function PersonSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': absoluteUrl('/#person'),
        name: 'Tarek Alaaddin',
        url: absoluteUrl(),
        description:
          'Software engineer with expertise in backend development, cloud architecture, and full-stack applications. Creator of Taskitos and ExpandNote.',
        jobTitle: 'AI Engineer',
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
          'https://www.youtube.com/@TarekAlaaddin',
          'https://www.youtube.com/@TarekAlaaddinUnfiltered',
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
        '@id': absoluteUrl('/#website'),
        name: 'Tarek Alaaddin',
        url: absoluteUrl(),
        description:
          'Software engineer with expertise in backend development, cloud architecture, and full-stack applications.',
        publisher: { '@id': absoluteUrl('/#person') },
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
  updated?: string
  tags: string[]
  category: string
}

export function BlogPostingSchema({
  title,
  description,
  slug,
  date,
  updated,
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
        url: absoluteUrl(`/blog/${slug}`),
        image: absoluteUrl(`/blog/${slug}/opengraph-image`),
        datePublished: date,
        dateModified: updated || date,
        articleSection: category,
        keywords: tags.join(', '),
        inLanguage: 'en-US',
        author: { '@id': absoluteUrl('/#person') },
        publisher: { '@id': absoluteUrl('/#person') },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': absoluteUrl(`/blog/${slug}`),
        },
      }}
    />
  )
}

interface BreadcrumbSchemaProps {
  // Path from site root to current page, newest-last. The root page is added
  // automatically, so pass only the inner crumbs.
  items: { name: string; path: string }[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const crumbs = [{ name: 'Home', path: '/' }, ...items]
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: absoluteUrl(crumb.path),
        })),
      }}
    />
  )
}

interface SoftwareApplicationSchemaProps {
  name: string
  description: string
  url: string
  image?: string
  applicationCategory?: string
  operatingSystem?: string
  // A free-form offer label like "Pro - $3.99/mo" or "Free". When undefined,
  // no Offer node is emitted.
  offer?: string
  // Related URLs (App Store, Play Store, GitHub) — surfaced as sameAs.
  sameAs?: string[]
}

export function SoftwareApplicationSchema({
  name,
  description,
  url,
  image,
  applicationCategory = 'ProductivityApplication',
  operatingSystem = 'Web, iOS, Android',
  offer,
  sameAs,
}: SoftwareApplicationSchemaProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    author: { '@id': absoluteUrl('/#person') },
  }
  if (image) data.image = image
  if (sameAs && sameAs.length > 0) data.sameAs = sameAs
  if (offer) {
    // Schema.org requires an Offer with a price. A free-form label is enough
    // for Google to accept the node; the free tier counts as price 0.
    const isFree = /free/i.test(offer)
    data.offers = {
      '@type': 'Offer',
      price: isFree ? '0' : undefined,
      priceCurrency: 'USD',
      description: offer,
      availability: 'https://schema.org/InStock',
    }
  }
  return <JsonLd data={data} />
}

interface ProfilePageSchemaProps {
  // Canonical URL of the profile page itself.
  url: string
  // Last time the profile content changed, ISO 8601. Optional; omit if unknown.
  dateModified?: string
}

export function ProfilePageSchema({ url, dateModified }: ProfilePageSchemaProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: { '@id': absoluteUrl('/#person') },
    inLanguage: 'en-US',
  }
  if (dateModified) data.dateModified = dateModified
  return <JsonLd data={data} />
}
