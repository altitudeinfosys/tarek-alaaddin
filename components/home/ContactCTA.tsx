import TrackedLink from './TrackedLink'

export const PUBLIC_EMAIL = 'tarek@tarekalaaddin.com'

export default function ContactCTA() {
  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg px-6 py-12 md:py-14 text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
            Let&apos;s talk
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-balance">
            Hiring, or have a process worth automating?
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Send a note about the role or the problem. I read everything and reply within a day.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TrackedLink
              href="/contact"
              event="contact_click_cta"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary-600 dark:bg-primary-500 text-white font-semibold hover:bg-primary-700 dark:hover:bg-primary-400 transition shadow-lg shadow-primary-600/20"
            >
              Get in touch
            </TrackedLink>
            <TrackedLink
              href="/resume"
              event="resume_click_cta"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:border-primary-600 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition"
            >
              View resume
            </TrackedLink>
          </div>

          <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
            or email{' '}
            <a href={`mailto:${PUBLIC_EMAIL}`} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              {PUBLIC_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
