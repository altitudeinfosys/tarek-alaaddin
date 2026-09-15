import Image from 'next/image'
import Button from '@/components/ui/Button'

const CURRENTLY = [
  {
    label: 'Working on',
    value: 'Claude-powered automation pipelines; Taskitos mobile releases; PropertyPulse360; a Spring Boot + React 19 system for a Texas state agency',
  },
  {
    label: 'Looking for',
    value: 'Senior engineer or technical lead role where AI, automation, or product building is central — remote or Austin',
  },
  {
    label: 'Availability',
    value: 'Open to conversations now · can start on 30 days’ notice',
  },
]

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
        {/* Photo */}
        <div className="lg:col-span-5 relative">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl ring-1 ring-black/5">
            <Image
              src="/images/tarek-presenter.jpg"
              alt="Tarek Alaaddin presenting a platform architecture to a team"
              width={1536}
              height={1024}
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* dotted accent */}
          <div
            className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl opacity-40 hidden sm:block"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '12px 12px',
              color: '#0284c7',
            }}
          ></div>
        </div>

        {/* Copy */}
        <div className="lg:col-span-7">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
            About
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
            Engineer, builder, writer.
          </h2>

          <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
            <p>
              I&apos;ve spent 20+ years building enterprise-scale applications and leading technical teams —
              most recently the contract-administration system a Texas state agency runs on, front to back.
            </p>
            <p>
              The last few years I&apos;ve gone all-in on AI: agents and automations that run unattended, and
              four apps I built and ship myself. Writing about it here keeps me honest about what actually
              works versus what just demos well.
            </p>
            <p>
              I care about clean architecture, pragmatic delivery, and teams that ship without drama.
            </p>
          </div>

          {/* Currently */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-7 mb-8">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-gray-900 dark:text-white mb-4">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Currently
            </h3>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-2.5 text-[0.95rem]">
              {CURRENTLY.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-gray-500 dark:text-gray-400 font-medium">{row.label}</dt>
                  <dd className="text-gray-900 dark:text-gray-100">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Button href="/resume" variant="outline" size="lg">
            View full resume
          </Button>
        </div>
      </div>
    </section>
  )
}
