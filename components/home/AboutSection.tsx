import Image from 'next/image'
import Link from 'next/link'

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
    <section id="about" className="band band-grey">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-x-14 gap-y-8 items-start">
        {/* Photo */}
        <div className="lg:col-span-5">
          <Image
            src="/images/tarek-presenter.jpg"
            alt="Tarek Alaaddin presenting a platform architecture to a team"
            width={1536}
            height={1024}
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="w-full aspect-[4/3] object-cover object-center rounded-lg border border-gray-200 dark:border-gray-800"
          />
        </div>

        {/* Copy */}
        <div className="lg:col-span-7">
          <div className="eyebrow eyebrow-accent mb-2.5">About</div>
          <h2 className="h-section">Engineer, builder, writer.</h2>

          <div className="mt-5 mb-7 space-y-3.5 text-gray-600 dark:text-gray-300 text-[1.03rem] leading-relaxed">
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
          <dl className="mb-7 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {CURRENTLY.map((row) => (
              <div key={row.label} className="grid sm:grid-cols-[8rem_1fr] gap-x-4 gap-y-1 px-[1.125rem] py-3.5">
                <dt className="pt-0.5 font-mono text-[0.69rem] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                  {row.label}
                </dt>
                <dd className="text-[0.92rem] text-gray-900 dark:text-gray-100">{row.value}</dd>
              </div>
            ))}
          </dl>

          <Link href="/resume" className="btn-flat btn-flat-ghost">
            View full resume
          </Link>
        </div>
      </div>
    </section>
  )
}
