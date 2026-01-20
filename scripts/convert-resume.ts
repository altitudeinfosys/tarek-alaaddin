/**
 * Resume Converter Script
 *
 * Converts PDF or DOCX resume files to markdown format.
 *
 * Usage:
 *   npx ts-node scripts/convert-resume.ts
 *
 * Place your resume files in data/resumes/originals/
 * Output will be written to data/resumes/converted/
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs'
import { join, extname, basename } from 'path'

// Dynamic imports for optional dependencies
async function loadPdfParse() {
  try {
    const pdfParse = await import('pdf-parse')
    return pdfParse.default
  } catch {
    console.error('pdf-parse not found. Install with: npm install pdf-parse')
    return null
  }
}

async function loadMammoth() {
  try {
    const mammoth = await import('mammoth')
    return mammoth.default
  } catch {
    console.error('mammoth not found. Install with: npm install mammoth')
    return null
  }
}

const ORIGINALS_DIR = join(process.cwd(), 'data', 'resumes', 'originals')
const OUTPUT_DIR = join(process.cwd(), 'data', 'resumes', 'converted')

async function convertPdfToMarkdown(filePath: string): Promise<string> {
  const pdfParse = await loadPdfParse()
  if (!pdfParse) {
    throw new Error('pdf-parse is required for PDF conversion')
  }

  const dataBuffer = readFileSync(filePath)
  const data = await pdfParse(dataBuffer)

  // Basic cleanup and formatting
  let text = data.text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Try to restore paragraph breaks
    .replace(/\. ([A-Z])/g, '.\n\n$1')
    // Clean up bullet points
    .replace(/[•●○■]/g, '-')

  return formatAsMarkdown(text, basename(filePath, '.pdf'))
}

async function convertDocxToMarkdown(filePath: string): Promise<string> {
  const mammoth = await loadMammoth()
  if (!mammoth) {
    throw new Error('mammoth is required for DOCX conversion')
  }

  const result = await mammoth.convertToMarkdown({ path: filePath })

  if (result.messages.length > 0) {
    console.log('Conversion messages:', result.messages)
  }

  return result.value
}

function formatAsMarkdown(text: string, filename: string): string {
  // Add a header with the filename
  const header = `# Resume - ${filename}\n\n`

  // Try to identify and format sections
  const sections = [
    'Experience',
    'Education',
    'Skills',
    'Projects',
    'Summary',
    'Contact',
    'Certifications',
  ]

  let formatted = text

  // Try to add markdown headers for common sections
  for (const section of sections) {
    const regex = new RegExp(`(${section})\\s*:?\\s*`, 'gi')
    formatted = formatted.replace(regex, `\n\n## $1\n\n`)
  }

  return header + formatted.trim()
}

async function main() {
  console.log('Resume Converter')
  console.log('================\n')

  // Check if originals directory exists
  if (!existsSync(ORIGINALS_DIR)) {
    console.log(`Creating originals directory: ${ORIGINALS_DIR}`)
    mkdirSync(ORIGINALS_DIR, { recursive: true })
    console.log('\nPlace your PDF or DOCX resume files in:')
    console.log(`  ${ORIGINALS_DIR}`)
    console.log('\nThen run this script again.')
    return
  }

  // Create output directory if needed
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Find resume files
  const files = readdirSync(ORIGINALS_DIR).filter(file => {
    const ext = extname(file).toLowerCase()
    return ext === '.pdf' || ext === '.docx'
  })

  if (files.length === 0) {
    console.log('No PDF or DOCX files found in:')
    console.log(`  ${ORIGINALS_DIR}`)
    console.log('\nSupported formats: .pdf, .docx')
    return
  }

  console.log(`Found ${files.length} resume file(s):\n`)

  for (const file of files) {
    const filePath = join(ORIGINALS_DIR, file)
    const ext = extname(file).toLowerCase()
    const outputName = basename(file, ext) + '.md'
    const outputPath = join(OUTPUT_DIR, outputName)

    console.log(`Converting: ${file}`)

    try {
      let markdown: string

      if (ext === '.pdf') {
        markdown = await convertPdfToMarkdown(filePath)
      } else if (ext === '.docx') {
        markdown = await convertDocxToMarkdown(filePath)
      } else {
        console.log(`  Skipping unsupported format: ${ext}`)
        continue
      }

      writeFileSync(outputPath, markdown)
      console.log(`  ✓ Saved to: ${outputPath}\n`)

    } catch (error) {
      console.error(`  ✗ Error converting ${file}:`, error)
    }
  }

  console.log('\nConversion complete!')
  console.log('\nNext steps:')
  console.log('1. Review the converted files in data/resumes/converted/')
  console.log('2. Copy relevant content to your resume markdown files:')
  console.log('   - data/resumes/fullstack.md')
  console.log('   - data/resumes/backend.md')
  console.log('   - data/resumes/leadership.md')
  console.log('3. Add additional context to data/resumes/context.md')
}

main().catch(console.error)
