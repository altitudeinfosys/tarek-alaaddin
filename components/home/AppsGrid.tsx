import { apps } from '@/data/apps'

export default function AppsGrid() {
  return (
    <section id="apps" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
            Apps I&apos;ve shipped
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-balance">
            Four products, built end to end.
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-2xl">
            Three in the App Store and Google Play, one on the web — each live and in use, each with its own site.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 hover:-translate-y-0.5 transition p-5"
            >
              <span className="flex-none w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-display font-extrabold text-lg">
                {app.name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {app.name}
                  <span className="sr-only"> (opens in new tab)</span>
                </span>
                <span className="block mt-1 text-sm text-gray-500 dark:text-gray-400 leading-snug">{app.tagline}</span>
                <span className="inline-block mt-2 text-[0.66rem] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                  {app.platforms}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
