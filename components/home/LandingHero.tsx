import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function LandingHero() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          Tarek Alaaddin
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-6">
          I build AI products & share what I learn
        </h2>

        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          Creator of <span className="font-semibold text-primary-600 dark:text-primary-400">Taskitos</span> and <span className="font-semibold text-primary-600 dark:text-primary-400">ExpandNote</span>. I write about productivity, AI tools, and building SaaS products.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/blog">
            <Button size="lg">
              Latest Posts
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
