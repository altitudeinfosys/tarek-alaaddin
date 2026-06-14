const SKILLS = [
  'Java / Spring',
  'React & Next.js',
  'Azure & Cloud',
  'AI Engineering',
  'Team Leadership',
  'SaaS Products',
]

const STATS = [
  { value: '20+', label: 'Years experience' },
  { value: '2', label: 'Products shipped' },
  { value: 'AI', label: 'Focused & shipping' },
  { value: '∞', label: 'Always learning' },
]

export default function Highlights() {
  return (
    <>
      {/* Skill marquee */}
      <section
        aria-label="Skills"
        className="border-y border-gray-800 dark:border-gray-700 bg-gray-900 dark:bg-gray-950 py-4 overflow-hidden"
      >
        <div className="flex w-max animate-marquee">
          {[0, 1].map((dup) => (
            <div
              key={dup}
              aria-hidden={dup === 1}
              className="flex items-center gap-8 pr-8 text-sm font-display font-semibold uppercase tracking-widest text-white/80"
            >
              {SKILLS.map((skill, i) => (
                <span key={skill} className="flex items-center gap-8">
                  <span className={i % 2 === 0 ? 'text-primary-400' : ''}>{skill}</span>
                  <span className="text-white/30">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Stat cards overlapping the marquee */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6"
            >
              <div className="text-4xl font-display font-extrabold text-primary-600 dark:text-primary-400">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
