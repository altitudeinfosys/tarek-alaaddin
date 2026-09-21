'use client'

interface HeroProps {
  onAskAI: () => void
}

const PROFILE = {
  name: 'Tarek Alaaddin',
  title: 'Senior Programmer Analyst / Technical Lead',
  tagline: '20+ years building large-scale, mission-critical systems in Java/Spring, React, and cloud',
  status: 'Open to opportunities',
  skills: ['Java', 'Spring Boot', 'React', 'Azure', 'AI/Vibe Coding', 'Team Leadership'],
}

export default function Hero({ onAskAI }: HeroProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12 md:pt-[4.5rem] md:pb-14 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="eyebrow inline-flex items-center gap-2">
          <span className="inline-block h-[7px] w-[7px] rounded-full bg-green-500" />
          Resume · {PROFILE.status}
        </div>

        <h1 className="mt-4 font-display font-bold tracking-[-0.035em] leading-[1.02] text-[2.5rem] sm:text-6xl lg:text-[4.25rem] text-gray-900 dark:text-white">
          {PROFILE.name}
        </h1>
        <p className="mt-3.5 font-display font-semibold tracking-[-0.01em] text-xl sm:text-2xl text-gray-900 dark:text-white">
          {PROFILE.title}
        </p>
        <p className="mt-2.5 text-[1.05rem] text-gray-700 dark:text-gray-300 max-w-2xl">{PROFILE.tagline}</p>

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {PROFILE.skills.map((skill) => (
            <li key={skill} className="chip">
              {skill}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onAskAI} className="btn-flat btn-flat-primary">
            Ask AI about me
          </button>
          <a href="#fit-check" className="btn-flat btn-flat-ghost">
            Check job fit
          </a>
        </div>
      </div>
    </section>
  )
}
