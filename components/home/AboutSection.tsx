import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AboutSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
          About
        </h2>

        <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-10">
          <p>
            I'm a software engineer with over 20 years of experience building enterprise-scale applications
            and leading technical teams. My expertise spans from backend systems in Java/Spring Boot to
            modern frontend development with React and Next.js.
          </p>

          <p>
            Recently, I've been focused on building AI-powered SaaS products. I created{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">Taskitos</span>, a task manager
            that uses behavioral science and AI to ensure you never miss what matters, and{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">ExpandNote</span>, a note-taking
            app supercharged with AI automation profiles.
          </p>

          <p>
            I'm passionate about product development, clean architecture, and using AI to solve real-world
            productivity problems. Whether it's architecting microservices, integrating AI capabilities, or
            leading development teams, I bring a pragmatic approach focused on delivering value.
          </p>
        </div>

        {/* Products Highlight */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 p-8 rounded-xl text-white mb-8">
          <h3 className="text-xl font-bold mb-6">Built & Shipped</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">Taskitos</div>
                <div className="text-primary-100">AI-powered task manager with persistent reminders</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">ExpandNote</div>
                <div className="text-primary-100">Note-taking app with AI automation profiles</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/blog">
            <Button variant="outline" size="lg">
              More About Me
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
