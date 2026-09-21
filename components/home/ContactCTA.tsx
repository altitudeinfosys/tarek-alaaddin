import TrackedLink from './TrackedLink'

export const PUBLIC_EMAIL = 'tarek@tarekalaaddin.com'

export default function ContactCTA() {
  return (
    <section id="contact" className="band text-center">
      <div className="max-w-6xl mx-auto">
        <div className="eyebrow eyebrow-accent mb-2.5">Let&apos;s talk</div>
        <h2 className="h-section">Hiring, or have a process worth automating?</h2>
        <p className="mt-4 text-[1.05rem] text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Send a note about the role or the problem. I read everything and reply within a day.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <TrackedLink href="/contact" event="contact_click_cta" className="btn-flat btn-flat-primary">
            Get in touch
          </TrackedLink>
          <TrackedLink href="/resume" event="resume_click_cta" className="btn-flat btn-flat-ghost">
            View resume
          </TrackedLink>
        </div>

        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          or email{' '}
          <a href={`mailto:${PUBLIC_EMAIL}`} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            {PUBLIC_EMAIL}
          </a>
        </p>
      </div>
    </section>
  )
}
