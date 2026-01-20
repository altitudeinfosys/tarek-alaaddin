'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import Experience from '@/components/Experience'
import Skills from '@/components/Skills'
import AskAIModal from '@/components/AskAIModal'
import FitCheck from '@/components/FitCheck'
import Footer from '@/components/Footer'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  return (
    <main className="min-h-screen">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Hero Section */}
      <Hero onAskAI={() => setIsAIModalOpen(true)} />

      {/* Experience Section */}
      <section id="experience" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h2 className="section-title">Experience</h2>
        <Experience />
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto bg-gray-50 dark:bg-gray-800/50">
        <h2 className="section-title">Skills</h2>
        <Skills />
      </section>

      {/* Fit Check Section */}
      <section id="fit-check" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h2 className="section-title">Fit Check</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Paste a job description and get an honest assessment of how well my background matches the role.
        </p>
        <FitCheck />
      </section>

      {/* Footer */}
      <Footer />

      {/* AI Chat Modal */}
      <AskAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </main>
  )
}
