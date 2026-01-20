'use client'

import { useState } from 'react'

const EXPERIENCES = [
  {
    id: 1,
    title: 'Senior Programmer Analyst / Technical Lead',
    company: 'Texas Commission on Environmental Quality',
    location: 'Austin, TX (Contract)',
    period: 'May 2025 - Present',
    current: true,
    highlights: [
      'Lead end-to-end migration of a legacy Java Struts app to Spring Boot + React for a mission-critical government system',
      'Design modern RESTful architecture, establish coding standards, and guide implementation across the team',
      'Own and prioritize user stories, manage bug triage, and coordinate closely with DevOps and DBA teams',
      'Leverage AI-driven "vibe coding" workflows to accelerate feature delivery and refactoring while maintaining code quality',
    ],
    technologies: ['Spring Boot', 'React', 'Java', 'Oracle', 'REST APIs'],
    aiContext: `This is my current role where I'm leading a major modernization effort. The challenge is migrating a legacy Struts application while maintaining business continuity. I'm using AI tools extensively to accelerate development - what I call "vibe coding" - which lets me ship features 3-5x faster while maintaining quality.`,
  },
  {
    id: 2,
    title: 'Senior Programmer Analyst',
    company: 'General Motors',
    location: 'Austin, TX',
    period: 'January 2018 - March 2025',
    current: false,
    highlights: [
      'Led 15 developers to launch MyBA, an internal administration app, from concept to production in 9 months',
      'Architected and implemented the CAP Agreements backend using Spring Boot and Azure, supporting complex fleet discount logic',
      'Improved database performance and supported migration of services to Azure cloud infrastructure',
      'Built Spring Batch solutions to handle high-volume data ingestion (millions of records daily)',
      'Partnered with PMs, QAs, and architects across multiple departments to ensure on-time, high-quality delivery',
    ],
    technologies: ['Spring Boot', 'Azure', 'Spring Batch', 'React', 'SQL Server'],
    aiContext: `GM was a pivotal role where I grew into technical leadership. Leading a team of 15 to deliver MyBA in 9 months was my biggest achievement - we went from idea to production with a complex internal admin system. The CAP Agreements feature I architected became one of the most-used features on the platform, handling complex fleet discount logic for major customers.`,
  },
  {
    id: 3,
    title: 'Senior Programmer Analyst',
    company: 'Texas Commission on Environmental Quality',
    location: 'Austin, TX',
    period: 'August 2006 - December 2017',
    current: false,
    highlights: [
      'Led enhancement and defect resolution for large-scale environmental and permitting systems',
      'Modernized a legacy JSP application into a Spring Boot + React stack, increasing maintainability and development speed',
      'Created automation scripts and alerting to improve system stability and reduce production incidents',
    ],
    technologies: ['Java', 'Spring Boot', 'React', 'Oracle', 'JSP'],
    aiContext: `This was my foundation in enterprise development. I spent 11 years building and maintaining mission-critical environmental systems for the state of Texas. The experience taught me how to work with legacy systems, handle complex business logic, and gradually modernize without breaking production systems.`,
  },
  {
    id: 4,
    title: 'Independent SaaS Developer',
    company: 'AI-Accelerated "Vibe Coding"',
    location: 'Remote',
    period: 'Ongoing Side Projects',
    current: true,
    highlights: [
      'Use AI tools (Claude Code, Copilot/Codex, Gemini) to ship features 3-5x faster as a solo developer',
      'Built Taskitos - task management app with smart, persistent notifications that "nag" tasks to completion',
      'Built ExpandNote - notes with automation hooks, letting notes trigger workflows and integrations',
      'Built PropertyPulse360 - property management for small landlords: rent, expenses, distributions, lease tracking',
    ],
    technologies: ['Next.js', 'Supabase', 'TypeScript', 'AI Tools', 'Vercel'],
    aiContext: `This represents my exploration of AI-assisted development. I've built 3 full-stack SaaS apps using what I call "vibe coding" - using AI tools to achieve near team-level speed and quality as a solo developer. It's changed how I think about software development and productivity.`,
  },
]

export default function Experience() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      {EXPERIENCES.map((exp, index) => (
        <div
          key={exp.id}
          className="card p-6 hover:shadow-md transition-shadow"
        >
          {/* Timeline connector */}
          <div className="flex gap-4">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  exp.current ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              {index < EXPERIENCES.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 -mt-1">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {exp.title}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-medium">{exp.company}</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>{exp.period}</p>
                  <p>{exp.location}</p>
                </div>
              </div>

              {/* Highlights */}
              <ul className="mt-3 space-y-2">
                {exp.highlights.map((highlight, i) => (
                  <li key={i} className="flex gap-2 text-gray-600 dark:text-gray-300">
                    <span className="text-primary-500 mt-1.5">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2 mt-4">
                {exp.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* AI Context Toggle */}
              {exp.aiContext && (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === exp.id ? null : exp.id)
                    }
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedId === exp.id ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {expandedId === exp.id ? 'Hide' : 'View'} AI Context
                  </button>
                  {expandedId === exp.id && (
                    <div className="mt-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-primary-100 dark:border-primary-800">
                      <p className="italic">{exp.aiContext}</p>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        This context helps the AI answer deeper questions about
                        this role.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
