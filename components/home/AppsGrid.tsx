import { apps } from '@/data/apps'

export default function AppsGrid() {
  return (
    <section id="apps" className="band">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="eyebrow eyebrow-accent mb-2.5">Apps I&apos;ve shipped</div>
          <h2 className="h-section">Four products, built end to end.</h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300 max-w-2xl">
            Three in the App Store and Google Play, one on the web — each live and in use, each with its own site.
          </p>
        </div>

        <div className="thin-grid sm:grid-cols-2 lg:grid-cols-4">
          {apps.map((app) => (
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
      </div>
    </section>
  )
}
