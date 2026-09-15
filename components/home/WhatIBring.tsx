const PILLARS = [
  {
    title: 'AI & automation',
    body: 'Agents, MCP servers, and unattended pipelines built directly on the Claude API — including the content pipeline that writes, reviews, and publishes to this site and social on a schedule.',
    tags: ['Claude API', 'Agents', 'MCP', 'n8n', 'Python'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z" />
        <path d="M5 17l.9 2.1L8 20l-2.1.9L5 23l-.9-2.1L2 20l2.1-.9z" />
      </svg>
    ),
  },
  {
    title: 'App builder',
    body: 'Idea to production, solo, four times over: Taskitos, ExpandNote, and SayCopy on the App Store and Google Play, PropertyPulse360 on the web. Next.js, React Native, Supabase, and the AI features people actually use.',
    tags: ['Next.js', 'React Native', 'Supabase', 'Stripe', 'App Store'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="5" y="2" width="14" height="20" rx="2.5" />
        <path d="M10 18h4" />
      </svg>
    ),
  },
  {
    title: 'Enterprise engineering',
    body: '20+ years of Java/Spring Boot and React systems for state agencies and regulated businesses — and the team leadership to get them shipped without drama.',
    tags: ['Spring Boot', 'Oracle', 'React 19', 'Azure', 'Tech lead'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="6" rx="1.5" />
        <rect x="3" y="14" width="18" height="6" rx="1.5" />
        <path d="M7 7h.01M7 17h.01" />
      </svg>
    ),
  },
]

export default function WhatIBring() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
            What I bring
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-balance">
            AI, automation, and apps that ship.
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-2xl">
            Three things I&apos;m hired for — each backed by something real you can click on, not a skills list.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="flex flex-col gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                {pillar.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">{pillar.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-[0.95rem] leading-relaxed">{pillar.body}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {pillar.tags.map((tag) => (
                  <li
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
