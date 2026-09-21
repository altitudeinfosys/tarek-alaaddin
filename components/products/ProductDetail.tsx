import { Product } from '@/types/products'
import ScreenshotGallery from './ScreenshotGallery'

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div id={product.id} className="scroll-mt-20">
      <div className="panel bg-gray-100 dark:bg-gray-950 p-6 md:p-10 mb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="font-display tracking-[-0.025em] text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {product.name}
            </h2>
            <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400 mb-4">
              {product.tagline}
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="px-3.5 py-2 bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Web: </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{product.status.web}</span>
          </div>
          <div className="px-3.5 py-2 bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">iOS: </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{product.status.ios}</span>
          </div>
          <div className="px-3.5 py-2 bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Android: </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{product.status.android}</span>
          </div>
        </div>

        {/* Full Description */}
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          {product.fullDescription}
        </p>

        {/* Links */}
        <div className="flex flex-wrap gap-4">
          {product.links.web && (
            <a
              href={product.links.web}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-flat btn-flat-primary"
            >
              Visit Website
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          {product.links.github && (
            <a
              href={product.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-flat btn-flat-ghost"
            >
              View on GitHub
              <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h3 className="font-display tracking-[-0.015em] text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.features.map((feature, index) => {
            const [title, description] = feature.split(' - ')
            return (
              <div
                key={index}
                className="panel flex items-start p-4"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-primary-50 dark:bg-primary-900/30 rounded flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mb-12">
        <h3 className="font-display tracking-[-0.015em] text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Technology Stack
        </h3>
        <div className="flex flex-wrap gap-3">
          {product.technologies.map((tech, index) => (
            <span
              key={index}
              className="chip text-[0.78rem] px-2.5 py-1"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Pricing (if available) */}
      {product.pricing && (
        <div className="mb-12">
          <h3 className="font-display tracking-[-0.015em] text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.pricing.free && (
              <div className="panel p-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Free</h4>
                <p className="text-gray-600 dark:text-gray-400">{product.pricing.free}</p>
              </div>
            )}
            {product.pricing.pro && (
              <div className="panel p-6 border-primary-600 dark:border-primary-400">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pro</h4>
                <p className="text-gray-600 dark:text-gray-400">{product.pricing.pro}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screenshots */}
      {product.images && product.images.length > 0 && (
        <div>
          <h3 className="font-display tracking-[-0.015em] text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Screenshots
          </h3>
          <ScreenshotGallery images={product.images} productName={product.name} />
        </div>
      )}
    </div>
  )
}
