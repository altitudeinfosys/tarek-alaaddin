import Link from 'next/link'
import { Product } from '@/types/products'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all hover:shadow-xl p-6">
      {/* Product Icon/Logo */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {product.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.status.web}
            </p>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-3">
        {product.tagline}
      </p>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {product.description}
      </p>

      {/* Key Features (Top 3) */}
      <ul className="space-y-2 mb-6">
        {product.features.slice(0, 3).map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature.split(' - ')[0]}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex gap-3">
        {product.links.web && (
          <a
            href={product.links.web}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-center text-sm"
          >
            Visit Site
          </a>
        )}
        <Link
          href={`/products#${product.id}`}
          className="flex-1 px-4 py-2 border-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium rounded-lg transition-colors text-center text-sm"
        >
          Learn More
        </Link>
      </div>
    </div>
  )
}
