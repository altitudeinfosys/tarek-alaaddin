# Blog Post Creation Guide

This document explains how to create and publish blog posts on this site.

## Quick Start

**All blog posts live in:** `/content/blog/`

**To create a new post:**
1. Create a new `.mdx` file in `/content/blog/`
2. Add frontmatter (metadata) at the top
3. Write your content in Markdown
4. Save the file
5. The post appears automatically on the site

## File Structure

```
content/
└── blog/
    ├── my-first-post.mdx
    ├── another-post.mdx
    └── latest-article.mdx
```

## File Naming Conventions

**Format:** Use lowercase with hyphens (kebab-case)

**Good:**
- `building-taskitos-with-ai.mdx`
- `my-productivity-system.mdx`
- `spring-boot-microservices.mdx`

**Bad:**
- `Building Taskitos.mdx` (spaces, capitals)
- `my_post.mdx` (underscores)
- `post1.mdx` (not descriptive)

**Best practices:**
- Keep names descriptive but concise
- Use the main topic as the filename
- Avoid dates in filenames (use frontmatter instead)

## Frontmatter Structure

Every blog post MUST start with frontmatter (metadata) between `---` markers:

```mdx
---
title: "Your Post Title Here"
description: "A compelling one-sentence summary of your post"
date: "2025-01-25"
category: "ai"
tags: ["ai", "productivity", "taskitos"]
image: "/images/blog/post-image.jpg"
published: true
featured: false
---

Your content starts here...
```

### Frontmatter Fields Explained

| Field | Required | Type | Description | Example |
|-------|----------|------|-------------|---------|
| `title` | ✅ Yes | String | Post title (shown on cards and page) | `"Building Taskitos: From Idea to Launch"` |
| `description` | ✅ Yes | String | One-sentence summary for cards and SEO | `"The journey of building an AI task manager"` |
| `date` | ✅ Yes | String | Publication date (YYYY-MM-DD format) | `"2025-01-25"` |
| `category` | ✅ Yes | String | One of: `"ai"`, `"productivity"`, `"development"` | `"ai"` |
| `tags` | ✅ Yes | Array | List of relevant tags (lowercase) | `["ai", "product-development", "taskitos"]` |
| `image` | ❌ No | String | Path to header image | `"/images/blog/taskitos-hero.jpg"` |
| `published` | ❌ No | Boolean | Show on site? (default: true) | `true` or `false` |
| `featured` | ❌ No | Boolean | Mark as featured post? (default: false) | `true` or `false` |

### Categories

Choose ONE category per post:

- **`ai`** - Artificial Intelligence, AI tools, AI integration, LLMs, automation
- **`productivity`** - Productivity systems, time management, GTD, workflows
- **`development`** - Software engineering, coding, architecture, frameworks

### Tags

Add 3-5 relevant tags:

**Good tags:**
- Product names: `taskitos`, `expandnote`
- Technologies: `nextjs`, `react`, `spring-boot`, `ai`
- Topics: `productivity`, `time-management`, `microservices`
- Concepts: `behavioral-science`, `automation`, `saas`

**Bad tags:**
- Too generic: `software`, `coding`
- Too specific: `building-taskitos-on-january-15th`
- Duplicates category: If category is `ai`, don't also tag `ai`

### Featured Posts

Set `featured: true` to show posts in the "Featured" section on the homepage.

**Guidelines:**
- Limit to 2-3 featured posts at a time
- Feature your best, most comprehensive content
- Update featured posts monthly to keep content fresh
- Remove `featured: true` from older posts when adding new ones

### Draft Posts

To work on a post without publishing it:

```yaml
published: false
```

The post won't appear on the blog index or homepage, but you can still preview it at `/blog/your-post-slug`.

## Writing Content (MDX)

MDX = Markdown + React components. You can use standard Markdown plus custom components.

### Standard Markdown

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- Bulleted list
- Another item

1. Numbered list
2. Another item

[Link text](https://example.com)

![Alt text](/images/example.png)
```

### Code Blocks

Use triple backticks with language for syntax highlighting:

\`\`\`javascript
const greeting = "Hello, world!"
console.log(greeting)
\`\`\`

\`\`\`typescript
interface User {
  name: string
  email: string
}
\`\`\`

### Custom MDX Components

Your site supports custom React components (if configured):

```mdx
<Callout type="info">
This is an informational callout
</Callout>

<Callout type="warning">
This is a warning callout
</Callout>

<Callout type="success">
This is a success callout
</Callout>
```

## Step-by-Step: Creating a New Blog Post

### Step 1: Create the file

```bash
cd /Users/tarekalaaddin/Projects/code/tarek-alaaddin
touch content/blog/my-new-post.mdx
```

### Step 2: Add frontmatter

Open the file and add metadata:

```mdx
---
title: "My New Post Title"
description: "A compelling description of what this post covers"
date: "2025-01-25"
category: "productivity"
tags: ["productivity", "taskitos", "time-management"]
published: true
featured: false
---
```

### Step 3: Write your content

Add your content below the frontmatter:

```mdx
## Introduction

Start with why this topic matters...

## Main Content

Break your post into clear sections...

### Subsection

Use H3 for subsections...

## Conclusion

Wrap up with key takeaways...
```

### Step 4: Preview

Start the dev server:

```bash
npm run dev
```

Visit: `http://localhost:3004/blog/my-new-post`

### Step 5: Publish

Once satisfied:
1. Set `published: true` in frontmatter (if not already)
2. Commit the file to git
3. Push to GitHub
4. Deploy (automatic if using Vercel/Netlify)

## Writing Tips

### Post Structure

**Effective blog post structure:**

1. **Hook** - Start with a problem, story, or surprising fact
2. **Context** - Why does this matter? Who is this for?
3. **Main Content** - Break into clear sections (H2 headings)
4. **Examples** - Show, don't just tell
5. **Conclusion** - Key takeaways, next steps, or call to action

### Title Guidelines

**Good titles:**
- "Building Taskitos: From Idea to AI-Powered Task Manager"
- "My Productivity System: How I Stay Innovative and Get Things Done"
- "Spring Boot Microservices: Lessons from 20 Years of Enterprise Java"

**Bad titles:**
- "My Thoughts" (too vague)
- "How to Build a Task Manager with AI Using Next.js and Supabase" (too long)
- "Post #5" (not descriptive)

**Formula:** `[Main Topic]: [Benefit/Hook]`

### Description Guidelines

One sentence that makes readers want to click:

**Good:**
- "The complete productivity system I use to build products like Taskitos and ExpandNote while working full-time."
- "Hard-earned lessons from building and scaling Spring Boot microservices in production."

**Bad:**
- "This post talks about productivity." (boring)
- "I'll explain my entire system for being productive including..." (too long)

### Content Quality

**Do:**
- ✅ Write conversationally (use "I", "you")
- ✅ Share specific examples from your experience
- ✅ Include code snippets, screenshots, or diagrams
- ✅ Be opinionated (it's YOUR blog)
- ✅ Edit ruthlessly (cut fluff)

**Don't:**
- ❌ Use generic advice ("be more productive")
- ❌ Write walls of text (use headings, lists, breaks)
- ❌ Apologize for being a beginner (own your perspective)
- ❌ Copy-paste documentation (add your insights)

## File Organization

```
project-root/
├── content/
│   └── blog/               ← All blog posts here
│       ├── post-1.mdx
│       ├── post-2.mdx
│       └── post-3.mdx
├── public/
│   └── images/
│       └── blog/           ← Blog post images here
│           ├── post-1-hero.jpg
│           └── post-2-diagram.png
├── app/
│   └── blog/
│       ├── page.tsx        ← Blog index page
│       └── [slug]/
│           └── page.tsx    ← Individual post page
├── lib/
│   └── mdx.ts              ← Functions to read/parse posts
└── types/
    └── blog.ts             ← TypeScript types for posts
```

## Automation Possibilities (Future)

### Vision: AI-Powered Blog Post Generator

**Goal:** Create a Claude skill that generates blog posts from a topic prompt.

**Workflow:**
```
1. User provides topic: "How I use AI in my daily workflow"
2. Claude generates:
   - Frontmatter (title, description, category, tags)
   - Outline
   - Full content in MDX format
3. User reviews and adds custom text/examples
4. Claude saves as .mdx file in /content/blog/
5. Post automatically appears on site
```

**Skill features:**
- Topic analysis (choose category, suggest tags)
- Title generation (multiple options)
- Content generation based on existing blog style
- Custom text injection at specified sections
- Automatic slug generation
- Frontmatter validation

**Implementation approach:**
- Create skill at `/skills/blog-post-generator/`
- Use existing blog posts as style examples
- Integrate with mdx.ts functions
- Allow iterative refinement

**Example usage:**
```
User: "Create a blog post about my experience building ExpandNote"

Claude:
- Analyzes existing posts for style
- Generates title options
- Creates outline
- Writes draft content
- Asks for custom sections
- Saves to /content/blog/building-expandnote-experience.mdx
```

This would make publishing consistent, high-quality content much faster while maintaining your voice.

## Troubleshooting

### Post not showing up

**Check:**
1. ✅ File is in `/content/blog/`
2. ✅ File extension is `.mdx` (not `.md`)
3. ✅ Frontmatter is properly formatted (no syntax errors)
4. ✅ `published: true` (or field is omitted)
5. ✅ Date is not in the future
6. ✅ Dev server is running

### Frontmatter syntax error

Common mistakes:

```yaml
# WRONG - missing quotes around title with colon
title: Building Taskitos: From Idea to Launch

# RIGHT - quotes required for special characters
title: "Building Taskitos: From Idea to Launch"

# WRONG - tags as string
tags: "ai, productivity"

# RIGHT - tags as array
tags: ["ai", "productivity"]

# WRONG - wrong date format
date: "01/25/2025"

# RIGHT - YYYY-MM-DD format
date: "2025-01-25"
```

### Post shows but looks broken

**Check:**
1. MDX syntax is valid
2. Custom components are imported
3. Code blocks use proper triple backtick syntax
4. Images exist at specified paths

## Quick Reference

**Create new post:**
```bash
touch content/blog/new-post-title.mdx
```

**Minimal frontmatter:**
```yaml
---
title: "Post Title"
description: "Post description"
date: "2025-01-25"
category: "productivity"
tags: ["tag1", "tag2"]
published: true
---
```

**Make post featured:**
```yaml
featured: true
```

**Hide post (draft):**
```yaml
published: false
```

**Categories:** `ai`, `productivity`, `development`

**Dev server:** `npm run dev` → http://localhost:3004/blog

---

*Last updated: 2025-01-25*
