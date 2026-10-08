# Tarek Alaaddin

## Contact
- Contact: [Get in Touch](/contact)
- Location: Round Rock, Texas
- Citizenship: US Citizen

## Professional Summary

Senior Programmer Analyst / Technical Lead and AI Engineer with 20+ years building large-scale, mission-critical systems in Java/Spring, React, and cloud. Alongside enterprise work, I design, build, and ship full products end to end: Next.js web apps, React Native / Expo mobile apps released to the App Store and Google Play, Supabase and Postgres backends, and LLM-powered features on the Claude API. I use agentic AI tools (Claude Code, Codex, Cursor) daily to ship 3–5x faster while keeping clean architecture and production-grade quality.

## Key Highlights

- Led a team of 15 developers to deliver the MyBA admin app at General Motors from idea to production in 9 months
- Architected the CAP Agreements system for fleet discounts, now one of the platform's most used and requested features
- Built high-performance Spring Batch jobs processing millions of records daily
- Currently leading the migration of a legacy Java Struts system to React 19 + Spring Boot for a Texas state agency
- Shipped Taskitos, a React Native / Expo task app, to both the Apple App Store and Google Play
- Built and run 10+ products on Next.js, React Native, and Supabase, several with Claude-powered AI features, MCP servers, and offline-first sync

## Technical Skills

### Languages
Java, TypeScript, JavaScript, SQL, Python, Kotlin, C#

### Frontend
React (incl. React 19), Next.js (App Router, versions 14–16), Vite, Redux, Zustand, TanStack Query, React Hook Form, AG Grid, Tailwind CSS, shadcn/ui, MDX

### Mobile
React Native, Expo (SDK 54, Expo Router, EAS Build and Submit), push notifications with actionable responses, offline-first sync with PowerSync, in-app subscriptions with RevenueCat, App Store and Google Play releases

### Backend
Spring Boot, Spring Batch, Hibernate, Node.js, Next.js API routes and server actions, REST API design, webhooks, .NET Core, Struts (legacy migration)

### Databases & Backend Platforms
Oracle, SQL Server, PostgreSQL, Supabase (Postgres, Auth, Row Level Security, Storage, Realtime, pgvector), Neon serverless Postgres, Drizzle ORM

### Cloud, DevOps & Hosting
Vercel, Microsoft Azure, AWS, Docker, self-hosted services on Hetzner with Coolify, Jenkins, Azure DevOps, GitHub Actions, Git, Maven, Sentry, PostHog

### AI & LLM Engineering
Claude API (Anthropic SDK, structured outputs, prompt caching), OpenAI API, OpenRouter, Model Context Protocol (MCP) servers, AI agents and agentic workflows, voice-to-text and speech features, LLM-based email and document parsing, prompt engineering

### Agentic Development Tools
Claude Code, OpenAI Codex, Cursor, GitHub Copilot, Gemini

### Integrations & Automation
Stripe, Resend, AgentMail, AI voice and SMS agents (Retell, AgentPhone), n8n (self-hosted), Make.com, Zapier

### Web Scraping & Data Extraction
Scrapy, BeautifulSoup, Selenium, Apify, Python ETL pipelines

### Testing
JUnit, Jest, Vitest, Playwright, Selenium

### Practices
Agile/Scrum, system design, legacy modernization, code review, technical leadership

## Professional Experience

### Senior Programmer Analyst / Technical Lead – Texas Commission on Environmental Quality (Contract)
**May 2025 – Present**

- Lead the end-to-end migration of CATS (Contract Administration Tracking System), a legacy Java Struts app, to a React 19 + Spring Boot stack for a mission-critical state system that manages environmental contracts, work orders, invoices, and funding
- Front end: React 19, Vite, Redux, React Hook Form, React Router, AG Grid, Bootstrap; back end: Spring Boot, Java 17, Oracle
- Design the RESTful architecture, establish coding standards, review PRs, and guide implementation across the team
- Own and prioritize user stories, manage bug triage, and coordinate with DevOps and DBA teams on Maven builds and UAT/production releases
- Use AI-driven workflows (Claude Code, Codex automated PR review) to accelerate delivery and refactoring while maintaining code quality

### Senior Programmer Analyst – General Motors
**January 2018 – March 2025**

- Led 15 developers to launch MyBA, an internal administration app, from concept to production in 9 months
- Architected and implemented the CAP Agreements backend using Spring Boot and Azure, supporting complex fleet discount logic
- Improved database performance and supported migration of services to Azure cloud infrastructure
- Built Spring Batch solutions to handle high-volume data ingestion (millions of records daily)
- Partnered with PMs, QAs, and architects across multiple departments to ensure on-time, high-quality delivery

### Senior Programmer Analyst – Texas Commission on Environmental Quality
**August 2006 – December 2017**

- Led enhancement and defect resolution for large-scale environmental and permitting systems
- Modernized a legacy JSP application into a Spring Boot + React stack, increasing maintainability and development speed
- Created automation scripts and alerting to improve system stability and reduce production incidents

## Products Built and Shipped (Independent / Altitude InfoSys)

I build these as a solo developer working with AI coding agents. They are live, deployed products, not tutorials.

- **Taskitos** (taskitos.com): AI-powered task manager that nags tasks to done with persistent reminders, snooze, recurring tasks, and voice-to-task capture. pnpm monorepo with a Next.js 15 / React 19 web app and a React Native / Expo mobile app sharing a TypeScript package. Supabase backend, PowerSync offline-first sync (self-hosted on Hetzner via Coolify), RevenueCat subscriptions, Expo push notifications. Released to the Apple App Store and Google Play.
- **ExpandNote** (expandnote.com): AI note-taking app with voice-to-text, AI Profiles that process notes automatically, email-to-note, and workflow hooks. Next.js 16 web app plus Expo SDK 54 mobile app, Supabase with Row Level Security, PowerSync offline sync, Sentry, and a Model Context Protocol (MCP) server (local and remote) so AI assistants can read and write notes.
- **TextInvoice / SpeakInvoice** (textinvoicego.com): invoicing for contractors and tradespeople by text message or phone call. Inbound call or SMS goes to an AI voice/SMS agent, then a webhook, then Claude extracts the job details and drafts the invoice. Next.js, Supabase, Claude API, Resend, Sentry, PostHog.
- **SayCopy** (saycopy.app): privacy-focused React Native / Expo mobile app for recording, transcribing, translating, and organizing spoken text on iOS and Android, using user-supplied OpenRouter models.
- **AckPush**: notification hub where apps and AI agents send push notifications and the user answers from the notification itself (action buttons, inline text reply, snooze). Expo SDK 54 / React Native 0.81 mobile app, Next.js 16 web inbox and console, Supabase.
- **PropertyPulse360**: property management app for small landlords: rent, expenses, owner reporting, distributions, and lease tracking. Next.js 15, Supabase (Postgres, Auth, Storage), Resend. Vendor invoice emails arrive through AgentMail and Claude parses them into expenses, inferring the property, vendor, and line items.
- **RentalROI** (rentalroi.app): rental property investment calculator with web (Next.js) and mobile (Expo) apps in a monorepo with shared calculation, validation, and database packages, tested with Vitest.
- **LUZIT nutrition dashboard**: ingests daily Lose It! email summaries through AgentMail webhooks into Supabase and gives AI nutritionist analysis with the Claude API.
- **GetYourWebsiteReady** (getyourwebsiteready.com): web design agency site with an AI-powered website and GEO (generative engine optimization) audit tool. Next.js, Neon Postgres, Stripe, Resend, Claude API.
- **Second Brain**: personal knowledge base exposed as an MCP server on Supabase with pgvector hybrid search, used daily from Claude Code and Claude Desktop.
- **tarekalaaddin.com**: this site. Next.js, MDX blog, Neon + Drizzle, Resend newsletter, Vercel. Includes this fit-check tool (Claude API with structured outputs) and an autonomous AI content pipeline that drafts posts and publishes them through pull requests.
- **Client websites**: Next.js marketing sites for local businesses, such as Austin Patio, with Tailwind, Framer Motion, and generated local SEO pages, deployed on Vercel.

### Web Scraping & Data Projects

- Built custom web scrapers with Python Scrapy and BeautifulSoup to extract structured lead data from public sources
- Developed data pipelines using Apify and Python to collect, clean, and structure large datasets
- Built Selenium browser automation for JavaScript-rendered pages
- Automated end-to-end ETL workflows combining crawling, extraction, transformation, and storage

## Education

**Bachelor of Science in Computer Science**
University of Houston, Houston, Texas (December 1998)
