'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import Experience from '@/components/Experience'
import Skills from '@/components/Skills'
import AskAIModal from '@/components/AskAIModal'
import FitCheck from '@/components/FitCheck'

export default function ResumePageClient() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  return (
    <div>
      {/* Hero Section */}
      <Hero onAskAI={() => setIsAIModalOpen(true)} />

      {/* Experience Section */}
      <section id="experience" className="band band-grey">
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow eyebrow-accent mb-2.5">Experience</div>
          <h2 className="h-section mb-8">Where I&apos;ve worked</h2>
          <Experience />
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="band">
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow eyebrow-accent mb-2.5">Skills</div>
          <h2 className="h-section mb-8">What I work in</h2>
          <Skills />
        </div>
      </section>

      {/* Fit Check Section */}
      <section id="fit-check" className="band band-grey">
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow eyebrow-accent mb-2.5">Fit check</div>
          <h2 className="h-section">Paste a job description.</h2>
          <p className="mt-3 mb-8 text-[1.05rem] text-gray-700 dark:text-gray-300 max-w-2xl">
            Get an honest assessment of how well my background matches the role.
          </p>
          <FitCheck />
        </div>
      </section>

      {/* AI Chat Modal */}
      <AskAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  )
}
