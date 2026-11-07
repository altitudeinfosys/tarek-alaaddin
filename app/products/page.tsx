import { Metadata } from 'next'
import Link from 'next/link'
import { getAllProducts } from '@/data/products'
import { apps } from '@/data/apps'
import ProductDetail from '@/components/products/ProductDetail'
import { absoluteUrl } from '@/lib/site'
import { BreadcrumbSchema, SoftwareApplicationSchema } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Products | Tarek Alaaddin',
  description: 'Explore my AI-powered SaaS products: Taskitos (task manager with persistent reminders) and ExpandNote (AI-powered note-taking app).',
  keywords: ['Taskitos', 'ExpandNote', 'AI products', 'SaaS', 'productivity', 'note-taking', 'task manager'],
  alternates: {
    canonical: absoluteUrl('/products'),
  },
  openGraph: {
    title: 'Products | Tarek Alaaddin',
    description: 'Explore my AI-powered SaaS products: Taskitos and ExpandNote.',
    url: absoluteUrl('/products'),
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
}

export default function ProductsPage() {
  const products = getAllProducts()
  const otherApps = apps.filter((app) => !products.some((product) => product.id === app.id))

  return (
    <div className="bg-white dark:bg-gray-900">
      <BreadcrumbSchema items={[{ name: 'Products', path: '/products' }]} />
      {products.map((product) => {
        // Prefer the product's own site as the canonical URL; fall back to
        // the on-page anchor when there's no external web URL.
        const url = product.links.web ?? absoluteUrl(`/products#${product.id}`)
        const sameAs = [
          product.links.web,
          product.links.ios,
          product.links.android,
          product.links.github,
        ].filter((v): v is string => typeof v === 'string' && v.length > 0)
        const image = product.images[0]?.startsWith('http')
          ? product.images[0]
          : absoluteUrl(product.images[0] ?? '')
        // Combine free and paid tiers into one offer string Schema.org can
        // accept as a single Offer node.
        const offer = [product.pricing?.free, product.pricing?.pro]
          .filter(Boolean)
          .join(' · ')
        return (
          <SoftwareApplicationSchema
            key={product.id}
            name={product.name}
            description={product.fullDescription || product.description}
            url={url}
            image={image || undefined}
            applicationCategory="ProductivityApplication"
            operatingSystem="Web, iOS, Android"
            offer={offer || undefined}
            sameAs={sameAs.length > 0 ? sameAs : undefined}
          />
        )
      })}
      {/* Hero Section */}
      <section className="pt-14 md:pt-[4.5rem] pb-10 px-4 sm:px-6 lg:px-8 max-w-[76rem] mx-auto">
        <div className="eyebrow eyebrow-accent mb-3">Apps</div>
        <h1 className="font-display font-bold tracking-[-0.035em] leading-[1.02] text-[2.5rem] sm:text-6xl text-gray-900 dark:text-white mb-4">
          My products
        </h1>
        <p className="text-[1.15rem] text-gray-700 dark:text-gray-300 max-w-3xl mb-8">
          AI-powered SaaS applications built to solve real productivity problems.
          Each product combines modern technology with practical features to help you work smarter.
        </p>
        <div className="flex flex-wrap gap-2">
          {products.map((product) => (
            <a
              key={product.id}
              href={`#${product.id}`}
              className="btn-flat btn-flat-ghost"
            >
              {product.name}
            </a>
          ))}
        </div>
      </section>

      {/* Product Details */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-[76rem] mx-auto">
        {products.map((product, index) => (
          <div key={product.id}>
            <ProductDetail product={product} />
            {index < products.length - 1 && (
              <div className="my-16 border-t border-gray-300 dark:border-gray-800"></div>
            )}
          </div>
        ))}
      </section>

      {/* Apps without a full write-up here */}
      {otherApps.length > 0 && (
        <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-[76rem] mx-auto">
          <div className="eyebrow eyebrow-accent mb-5">Also shipped</div>
          <div className="thin-grid sm:grid-cols-2">
            {otherApps.map((app) => (
              <a key={app.id} href={app.url} target="_blank" rel="noopener noreferrer" className="group thin-cell">
                <span className="font-display text-lg font-bold tracking-[-0.015em] text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {app.name}
                  <span className="sr-only"> (opens in new tab)</span>
                </span>
                <span className="text-[0.9rem] leading-relaxed text-gray-700 dark:text-gray-300">{app.tagline}</span>
                <span className="mt-auto pt-1 font-mono text-[0.69rem] uppercase tracking-[0.08em] text-gray-600 dark:text-gray-400">
                  {app.platforms}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="band band-grey text-center mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow eyebrow-accent mb-2.5">Let&apos;s talk</div>
          <h2 className="h-section">Interested in building something similar?</h2>
          <p className="mt-4 text-[1.05rem] text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            I help entrepreneurs and businesses build AI-powered SaaS products from idea to production.
          </p>
          <Link href="/contact" className="btn-flat btn-flat-primary mt-8">
            Get in touch
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
