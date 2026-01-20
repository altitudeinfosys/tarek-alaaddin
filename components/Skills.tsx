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

const LEVEL_COLORS = {
  Expert: 'bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700',
  Advanced: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  Learning: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
}

export default function Skills() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SKILL_CATEGORIES.map((category) => (
        <div key={category.name} className="card p-6">
          {/* Category Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="text-primary-600 dark:text-primary-400">{category.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category.name}
            </h3>
          </div>

          {/* Skills List */}
          <div className="space-y-3">
            {category.skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center justify-between"
              >
                <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                    LEVEL_COLORS[skill.level as keyof typeof LEVEL_COLORS]
                  }`}
                >
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
