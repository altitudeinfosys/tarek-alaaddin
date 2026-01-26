import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function NewsletterCTA() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-2xl p-12 text-center text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 dark:bg-primary-600 rounded-full blur-3xl opacity-30 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500 dark:bg-primary-600 rounded-full blur-3xl opacity-30 -ml-32 -mb-32"></div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            How to Become Innovative and Productive
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Get my free guide packed with productivity tips, AI tools, and strategies I use to build products
            like Taskitos and ExpandNote. Plus, occasional insights on software engineering and product development.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/subscribe">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 dark:bg-white dark:text-primary-700 dark:hover:bg-gray-100">
                Get the Free Guide
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10">
                Read the Blog
              </Button>
            </Link>
          </div>

          <p className="text-sm text-primary-100 mt-6">
            Join the newsletter. No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
