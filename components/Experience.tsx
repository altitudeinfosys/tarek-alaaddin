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
    technologies: ['Spring Boot', 'React 19', 'Redux', 'Java', 'Oracle', 'REST APIs'],
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
      'Build and ship full products solo with AI coding agents (Claude Code, Codex), 3-5x faster than a traditional workflow',
      'Taskitos - AI task manager with voice-to-task; Next.js web + React Native/Expo mobile, released on the App Store and Google Play',
      'ExpandNote - AI notes app with voice-to-text, email-to-note, offline sync (PowerSync), and an MCP server for AI assistants',
      'TextInvoice - contractors text or call to create invoices; an AI voice/SMS agent plus Claude drafts the invoice',
      'SayCopy and AckPush - Expo mobile apps for speech transcription/translation and actionable push notifications for AI agents',
      'PropertyPulse360 and RentalROI - property management and rental investment apps; Claude parses vendor invoice emails into expenses',
      'Built this site\'s fit check on the Claude API, plus Python scrapers and ETL pipelines (Scrapy, BeautifulSoup, Selenium, Apify)',
    ],
    technologies: ['React Native', 'Expo', 'Next.js', 'Supabase', 'TypeScript', 'Claude API', 'MCP', 'PowerSync', 'Python', 'Vercel'],
    aiContext: `This is where I build and ship my own products with AI coding agents. I've shipped 10+ web and mobile apps on Next.js, React Native/Expo, and Supabase, including Taskitos on the App Store and Google Play, several with Claude-powered features and MCP servers. I also built the fit check on this site, which uses Claude to score a job description against my full history. On the data side, I build web scrapers and ETL pipelines using Python (Scrapy, BeautifulSoup, Selenium) and Apify to automate research and data collection workflows.`,
  },
]

export default function Experience() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-800 divide-y divide-gray-300 dark:divide-gray-800 bg-white dark:bg-gray-900">
      {EXPERIENCES.map((exp) => (
        <article key={exp.id} className="grid md:grid-cols-[13.5rem_1fr] gap-x-8 gap-y-4 px-5 py-6 md:px-6 md:py-7">
          {/* When / where */}
          <div className="flex flex-col items-start gap-1.5">
            <span className="font-mono font-medium text-[0.82rem] text-gray-900 dark:text-white">{exp.period}</span>
            <span className="font-mono text-[0.69rem] uppercase tracking-[0.08em] text-gray-600 dark:text-gray-400">
              {exp.location}
            </span>
            {exp.current && <span className="chip chip-accent mt-1">CURRENT</span>}
          </div>

          {/* Role */}
          <div>
            <h3 className="font-display text-xl font-bold tracking-[-0.015em] leading-tight text-gray-900 dark:text-white">
              {exp.title}
            </h3>
            <p className="mt-1 font-medium text-[0.95rem] text-primary-700 dark:text-primary-400">{exp.company}</p>

            {/* Highlights */}
            <ul className="mt-3.5 space-y-1.5 list-disc pl-[1.1rem] text-[0.92rem] leading-relaxed text-gray-700 dark:text-gray-300 marker:text-gray-400 dark:marker:text-gray-600">
              {exp.highlights.map((highlight, i) => (
                <li key={i}>{highlight}</li>
              ))}
            </ul>

            {/* Technologies */}
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {exp.technologies.map((tech) => (
                <li key={tech} className="chip">
                  {tech}
                </li>
              ))}
            </ul>

            {/* AI Context Toggle */}
            {exp.aiContext && (
              <div className="mt-4">
                <button
                  onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                  aria-expanded={expandedId === exp.id}
                  className="font-mono text-xs text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${expandedId === exp.id ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {expandedId === exp.id ? 'Hide' : 'View'} AI context
                </button>
                {expandedId === exp.id && (
                  <div className="mt-3 p-4 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                    <p className="italic">{exp.aiContext}</p>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      This context helps the AI answer deeper questions about this role.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
