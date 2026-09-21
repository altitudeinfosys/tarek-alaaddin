import Link from 'next/link'
import Image from 'next/image'
import TrackedLink from './TrackedLink'
import HeroArt from './HeroArt'

interface LandingHeroProps {
  postCount: number
  appCount: number
}

export default function LandingHero({ postCount, appCount }: LandingHeroProps) {
  const STATS = [
    { value: '20+', label: 'Years in production' },
    { value: String(postCount), label: 'Articles published' },
    { value: String(appCount), label: 'Apps shipped solo' },
  ]

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-900">
      <div className="max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-[4.5rem] grid lg:grid-cols-12 gap-8 lg:items-end">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-7 lg:pb-14">
          <div className="animate-rise reveal-1 eyebrow inline-flex items-center gap-2">
            <span className="relative flex h-[7px] w-[7px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-green-500"></span>
            </span>
            Tarek Alaaddin · Senior engineer · Open to roles
          </div>

          <h1 className="animate-rise reveal-2 mt-5 font-display font-bold tracking-[-0.035em] leading-[0.98] text-[2.75rem] sm:text-6xl lg:text-[5rem] text-gray-900 dark:text-white text-balance">
            Agents that run unattended. Apps that ship.
          </h1>

          <p className="animate-rise reveal-3 mt-6 text-lg sm:text-[1.3rem] text-gray-600 dark:text-gray-300 max-w-xl leading-normal">
            Senior engineer who builds{' '}
            <span className="font-medium text-primary-600 dark:text-primary-400">AI automations</span> and ships{' '}
            <span className="font-medium text-primary-600 dark:text-primary-400">apps</span> end to end — backed by 20+ years of enterprise Java and React.
          </p>

          <div className="animate-rise reveal-4 mt-8 flex flex-wrap items-center gap-3">
            <TrackedLink href="/resume" event="resume_click_hero" className="btn-flat btn-flat-primary">
              View resume
              <span aria-hidden="true">→</span>
            </TrackedLink>
            <TrackedLink href="/contact" event="contact_click_hero" className="btn-flat btn-flat-ghost">
              Get in touch
            </TrackedLink>
            <Link href="/blog" className="ml-1 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Read my writing →
            </Link>
          </div>

          <div className="animate-rise reveal-5 mt-5 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[0.72rem] uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400">
            <span>Round Rock, TX · Austin metro</span>
            <span>Remote-friendly</span>
            <span>Replies within a day</span>
          </div>

          <dl className="animate-rise reveal-6 mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 grid grid-cols-3 gap-x-4 sm:flex sm:flex-wrap sm:gap-x-12 gap-y-5">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse justify-end">
                <dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                  {stat.label}
                </dt>
                <dd className="font-mono font-medium text-[1.6rem] tabular-nums text-gray-900 dark:text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Photo over the drifting character field */}
        <div className="relative lg:col-span-5 lg:self-stretch min-h-[340px] lg:min-h-[420px]">
          <HeroArt className="art-fade absolute -top-5 left-0 w-full h-[calc(100%+1.25rem)] lg:-top-10 lg:-left-40 lg:w-[calc(100%+300px)] lg:max-w-none lg:h-[calc(100%+2.5rem)]" />
          <Image
            src="/images/tarek.jpg"
            alt="Tarek Alaaddin"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="photo-fade object-cover object-[50%_18%]"
          />
        </div>
      </div>
    </section>
  )
}
