import { Metadata } from 'next'
import { getAllProducts } from '@/data/products'
import ProductDetail from '@/components/products/ProductDetail'

export const metadata: Metadata = {
  title: 'Products | Tarek Alaaddin',
  description: 'Explore my AI-powered SaaS products: Taskitos (task manager with persistent reminders) and ExpandNote (AI-powered note-taking app).',
  keywords: ['Taskitos', 'ExpandNote', 'AI products', 'SaaS', 'productivity', 'note-taking', 'task manager'],
  openGraph: {
    title: 'Products | Tarek Alaaddin',
    description: 'Explore my AI-powered SaaS products: Taskitos and ExpandNote.',
    url: 'https://tarekalaaddin.com/products',
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
}

export default function ProductsPage() {
  const products = getAllProducts()

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
          My Products
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          AI-powered SaaS applications built to solve real productivity problems.
          Each product combines modern technology with practical features to help you work smarter.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {products.map((product) => (
            <a
              key={product.id}
              href={`#${product.id}`}
              className="px-6 py-3 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium rounded-lg transition-colors"
            >
              {product.name}
            </a>
          ))}
        </div>
      </section>

      {/* Product Details */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {products.map((product, index) => (
          <div key={product.id}>
            <ProductDetail product={product} />
            {index < products.length - 1 && (
              <div className="my-16 border-t border-gray-200 dark:border-gray-700"></div>
            )}
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Interested in Building Something Similar?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            I help entrepreneurs and businesses build AI-powered SaaS products from idea to production.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get in Touch
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  )
}
