import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export type ResumeType = 'fullstack' | 'backend' | 'leadership'

const RESUME_DIR = join(process.cwd(), 'data', 'resumes')

// Keywords that suggest which resume version to use
const RESUME_KEYWORDS: Record<ResumeType, string[]> = {
  backend: [
    'backend',
    'server',
    'api',
    'microservices',
    'distributed',
    'database',
    'python',
    'java',
    'go',
    'rust',
    'node',
    'devops',
    'infrastructure',
    'aws',
    'cloud',
    'kubernetes',
    'docker',
    'data engineer',
    'platform',
    'systems',
  ],
  leadership: [
    'lead',
    'manager',
    'director',
    'head of',
    'vp',
    'principal',
    'staff',
    'architect',
    'team',
    'mentor',
    'strategy',
    'roadmap',
  ],
  fullstack: [
    'fullstack',
    'full-stack',
    'full stack',
    'frontend',
    'react',
    'vue',
    'angular',
    'typescript',
    'javascript',
    'web',
    'ui',
    'ux',
  ],
}

export function selectResumeType(jobDescription: string): ResumeType {
  const lowerDesc = jobDescription.toLowerCase()

  // Count keyword matches for each type
  const scores: Record<ResumeType, number> = {
    backend: 0,
    leadership: 0,
    fullstack: 0,
  }

  for (const [type, keywords] of Object.entries(RESUME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        scores[type as ResumeType]++
      }
    }
  }

  // Leadership keywords take priority if present
  if (scores.leadership >= 2) {
    return 'leadership'
  }

  // Backend takes priority over fullstack for backend-heavy roles
  if (scores.backend > scores.fullstack) {
    return 'backend'
  }

  // Default to fullstack
  return 'fullstack'
}

export function loadResume(type: ResumeType): string {
  const filePath = join(RESUME_DIR, `${type}.md`)

  if (!existsSync(filePath)) {
    throw new Error(`Resume file not found: ${filePath}`)
  }

  return readFileSync(filePath, 'utf-8')
}

export function loadContext(): string {
  const filePath = join(RESUME_DIR, 'context.md')

  if (!existsSync(filePath)) {
    return ''
  }

  return readFileSync(filePath, 'utf-8')
}

export function loadAllResumes(): {
  fullstack: string
  backend: string
  leadership: string
  context: string
} {
  return {
    fullstack: loadResume('fullstack'),
    backend: loadResume('backend'),
    leadership: loadResume('leadership'),
    context: loadContext(),
  }
}

export function getResumeForChat(): string {
  // For general chat, use fullstack resume + context
  const resume = loadResume('fullstack')
  const context = loadContext()

  return `${resume}\n\n---\n\nAdditional Context:\n${context}`
}

export function getResumeForFitCheck(jobDescription: string): {
  resume: string
  type: ResumeType
} {
  const type = selectResumeType(jobDescription)
  const resume = loadResume(type)

  return { resume, type }
}
