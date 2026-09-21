const PILLARS = [
  {
    title: 'AI & automation',
    body: 'Agents, MCP servers, and unattended pipelines built directly on the Claude API — including the pipeline behind this site: the ideas are mine, and agents handle the research, review, and scheduled publishing to social.',
    tags: ['Claude API', 'Agents', 'MCP', 'n8n', 'Python'],
  },
  {
    title: 'App builder',
    body: 'Idea to production, solo, four times over: Taskitos, ExpandNote, and SayCopy on the App Store and Google Play, PropertyPulse360 on the web. Next.js, React Native, Supabase, and the AI features people actually use.',
    tags: ['Next.js', 'React Native', 'Supabase', 'Stripe', 'App Store'],
  },
  {
    title: 'Enterprise engineering',
    body: '20+ years of Java/Spring Boot and React systems for state agencies and regulated businesses — and the team leadership to get them shipped without drama.',
    tags: ['Spring Boot', 'Oracle', 'React 19', 'Azure', 'Tech lead'],
  },
]

export default function WhatIBring() {
  return (
    <>
      {/* Statement */}
      <section className="band">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[5fr_6fr] gap-x-16 gap-y-6 items-start">
          <h2 className="h-section">AI, automation, and apps that ship.</h2>
          <div className="space-y-4 text-[1.05rem] leading-relaxed text-gray-700 dark:text-gray-300">
            <p>
              Three things I&apos;m hired for — each backed by something real you can click on, not a skills list.
            </p>
            <p>
              <strong className="font-semibold text-gray-900 dark:text-white">
                The pipeline behind this site is one of them:
              </strong>{' '}
              the ideas and the point of view are mine; agents do the research, review each draft, and publish to social on a schedule.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars, in the order I lead with them */}
      <section className="band band-grey">
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow eyebrow-accent mb-8">What I bring</div>
          <div className="thin-grid md:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <article key={pillar.title} className="thin-cell">
                <span className="font-mono text-[0.72rem] tracking-[0.1em] text-primary-600 dark:text-primary-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl font-bold tracking-[-0.015em] text-gray-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="text-[0.92rem] leading-relaxed text-gray-700 dark:text-gray-300">{pillar.body}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {pillar.tags.map((tag) => (
                    <li key={tag} className="chip">
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
