import { getAllProducts } from '@/data/products'

export default function ProductShowcase() {
  const products = getAllProducts()

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Products I've Built
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all hover:shadow-lg p-6"
            >
              {/* Logo/Icon */}
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {product.name.charAt(0)}
                </span>
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h3>

              {/* Tagline */}
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {product.tagline}
              </p>

              {/* CTA */}
              {product.links.web && (
                <a
                  href={product.links.web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Visit Site
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
