import Link from 'next/link'
import Image from 'next/image'

const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/tarekalaaddin/',
    path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/altitudeinfosys',
    path: 'M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56v-2c-3.34.71-4.04-1.4-4.04-1.4-.55-1.36-1.34-1.72-1.34-1.72-1.08-.72.09-.7.09-.7 1.2.08 1.83 1.2 1.83 1.2 1.07 1.78 2.81 1.27 3.5.97.1-.76.42-1.27.76-1.56-2.67-.29-5.47-1.3-5.47-5.79 0-1.28.47-2.32 1.23-3.14-.12-.29-.53-1.49.12-3.1 0 0 1-.31 3.3 1.2a11.6 11.6 0 016 0c2.28-1.51 3.29-1.2 3.29-1.2.65 1.61.24 2.81.12 3.1.77.82 1.23 1.86 1.23 3.14 0 4.5-2.81 5.49-5.49 5.78.43.36.81 1.08.81 2.18v3.23c0 .31.22.68.83.56A12.02 12.02 0 0024 12.29C24 5.78 18.63.5 12 .5z',
  },
  {
    name: 'X',
    url: 'https://x.com/tarekalaaddin',
    path: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93z',
  },
]

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[34rem] h-[34rem] rounded-full bg-primary-200/50 dark:bg-primary-700/20 blur-3xl"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-12 gap-12 items-center">
        {/* Copy */}
        <div className="lg:col-span-7">
          <div className="animate-rise reveal-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm mb-7">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Building &amp; writing in public
          </div>

          <h1 className="animate-rise reveal-2 font-display font-extrabold tracking-[-0.03em] leading-[0.95] text-6xl sm:text-7xl lg:text-[5.25rem] text-gray-900 dark:text-white">
            Tarek<br />Alaaddin
          </h1>

          <p className="animate-rise reveal-3 mt-6 text-xl sm:text-2xl font-display font-semibold text-gray-700 dark:text-gray-200 max-w-xl leading-snug">
            I build AI products and{' '}
            <span className="text-primary-600 dark:text-primary-400">write about</span> what I learn shipping them.
          </p>

          <p className="animate-rise reveal-4 mt-5 text-lg text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
            20+ years engineering large-scale systems in Java/Spring, React, and the cloud. Creator of Taskitos &amp; ExpandNote.
          </p>

          <div className="animate-rise reveal-5 mt-9 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gray-900 dark:bg-primary-600 text-white font-semibold hover:bg-primary-600 dark:hover:bg-primary-500 transition shadow-lg shadow-gray-900/10"
            >
              Read my writing
              <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:border-primary-600 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition"
            >
              See my products
            </Link>
          </div>

          <div className="animate-rise reveal-6 mt-9 flex items-center gap-5 text-gray-400 dark:text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-widest">Find me</span>
            <span className="h-px w-8 bg-gray-300 dark:bg-gray-700"></span>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d={link.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div className="animate-rise reveal-3 lg:col-span-5 relative">
          <div className="absolute -inset-3 -rotate-3 rounded-[2rem] bg-gradient-to-br from-primary-500 to-primary-700"></div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-900/20 aspect-[4/5] ring-1 ring-black/5">
            <Image
              src="/images/tarek.jpg"
              alt="Tarek Alaaddin"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
          </div>
          <div className="absolute -bottom-5 -left-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-5 py-3 border border-gray-100 dark:border-gray-700">
            <div className="text-2xl font-display font-extrabold leading-none text-gray-900 dark:text-white">
              20<span className="text-primary-600 dark:text-primary-400">+</span>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-1">
              Years building
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
