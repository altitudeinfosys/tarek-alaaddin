'use client'

const SKILL_CATEGORIES = [
  {
    name: 'Languages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    skills: [
      { name: 'Java', level: 'Expert' },
      { name: 'JavaScript', level: 'Expert' },
      { name: 'SQL', level: 'Expert' },
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'Python', level: 'Advanced' },
      { name: 'Kotlin', level: 'Intermediate' },
      { name: 'C#', level: 'Intermediate' },
    ],
  },
  {
    name: 'Frameworks & Tools',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    skills: [
      { name: 'Spring Boot', level: 'Expert' },
      { name: 'Hibernate', level: 'Expert' },
      { name: 'React', level: 'Advanced' },
      { name: 'Next.js', level: 'Advanced' },
      { name: 'Spring Batch', level: 'Advanced' },
      { name: '.NET Core', level: 'Intermediate' },
      { name: 'Node.js', level: 'Intermediate' },
    ],
  },
  {
    name: 'Cloud & DevOps',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    skills: [
      { name: 'Microsoft Azure', level: 'Advanced' },
      { name: 'AWS', level: 'Intermediate' },
      { name: 'Jenkins', level: 'Advanced' },
      { name: 'Azure DevOps', level: 'Advanced' },
      { name: 'Git', level: 'Expert' },
      { name: 'Vercel', level: 'Advanced' },
    ],
  },
  {
    name: 'Databases',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    skills: [
      { name: 'Oracle', level: 'Expert' },
      { name: 'SQL Server', level: 'Expert' },
      { name: 'PostgreSQL', level: 'Advanced' },
      { name: 'Supabase', level: 'Advanced' },
    ],
  },
  {
    name: 'AI & Productivity',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    skills: [
      { name: 'Claude Code', level: 'Expert' },
      { name: 'GitHub Copilot', level: 'Advanced' },
      { name: 'Gemini', level: 'Advanced' },
      { name: 'AI-Accelerated Dev', level: 'Expert' },
    ],
  },
  {
    name: 'Web Scraping & Data',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    skills: [
      { name: 'Scrapy', level: 'Advanced' },
      { name: 'BeautifulSoup', level: 'Advanced' },
      { name: 'Selenium', level: 'Advanced' },
      { name: 'Apify', level: 'Intermediate' },
    ],
  },
  {
    name: 'Leadership & Process',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    skills: [
      { name: 'Team Leadership', level: 'Expert' },
      { name: 'Agile/Scrum', level: 'Expert' },
      { name: 'System Design', level: 'Expert' },
      { name: 'REST API Design', level: 'Expert' },
    ],
  },
]

export default function Skills() {
  return (
    <div className="thin-grid sm:grid-cols-2 lg:grid-cols-4">
      {SKILL_CATEGORIES.map((category, i) => (
        // An odd count leaves a hole in the last row; the final cell spans it
        <div
          key={category.name}
          className={`thin-cell ${
            i === SKILL_CATEGORIES.length - 1 && SKILL_CATEGORIES.length % 2 === 1 ? 'sm:col-span-2' : ''
          }`}
        >
          <h3 className="font-display text-base font-bold tracking-[-0.01em] text-gray-900 dark:text-white">
            {category.name}
          </h3>

          <ul className="space-y-1.5 text-[0.9rem]">
            {category.skills.map((skill) => (
              <li key={skill.name} className="flex items-baseline justify-between gap-3">
                <span className="text-gray-900 dark:text-gray-100">{skill.name}</span>
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-gray-600 dark:text-gray-400">
                  {skill.level}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
