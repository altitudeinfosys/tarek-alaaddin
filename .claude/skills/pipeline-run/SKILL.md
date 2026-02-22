---
name: pipeline-run
description: Automated content pipeline — reads a topic from the Google Sheets queue, generates a blog post, creates social media copy, posts to X and LinkedIn, and updates the queue status. Can run fully automated via scheduler or manually.
user-invocable: true
arguments: "optional: topic override (bypasses Sheet queue), or 'dry-run' to test without posting"
---

# Content Pipeline Runner

Master orchestrator for the blog-to-social-media pipeline. Reads topics from a Google Sheets queue, generates blog posts, creates social media copy, and posts to X and LinkedIn.

## Usage

- `/pipeline-run` — Process next queued topic from Google Sheet
- `/pipeline-run dry-run` — Run the pipeline but skip actual posting (for testing)
- `/pipeline-run "How I use AI for productivity"` — Override queue with a specific topic

## Prerequisites

- Chrome must be running with the Claude in Chrome extension active
- User must be logged into:
  - Google Sheets (for the content queue)
  - X (x.com) for Twitter posting
  - LinkedIn (linkedin.com) for LinkedIn posting
- The project repo must be at `/Users/tarekalaaddin/Projects/code/tarek-alaaddin/`
- `gh` CLI must be authenticated for GitHub operations

## Google Sheet Setup

**Sheet URL**: `https://docs.google.com/spreadsheets/d/1xfPdknbYRaftoy-BndQp6rkT3NTaebfcyr9nXTqunPA/edit?gid=0#gid=0`

**Expected columns** (Row 1 = headers):

| A: Topic | B: Status | C: Date Queued | D: Blog Slug | E: Blog URL | F: X Text | G: LinkedIn Text | H: Notes |

**Status values flow**: `queued` → `researching` → `generating` → `generated` → `posted-x` → `posted-linkedin` → `done`

On failure at any stage: status becomes `failed` and the error is written to the Notes column (H).

## Process

### Phase 0: Pre-Flight Checks

1. Get browser tab context: `mcp__claude-in-chrome__tabs_context_mcp`
2. Verify Chrome is responsive by creating a test tab
3. Check that the project repo is clean:
   ```bash
   cd /Users/tarekalaaddin/Projects/code/tarek-alaaddin && git status
   ```
4. Ensure we're on the `main` branch:
   ```bash
   git checkout main && git pull
   ```

### Phase 1: Read Queue from Google Sheet

1. Create a new tab: `mcp__claude-in-chrome__tabs_create_mcp`
2. Navigate to the Google Sheet URL using `mcp__claude-in-chrome__navigate`
3. Wait for the sheet to load (3 seconds)
4. Use `mcp__claude-in-chrome__read_page` or `mcp__claude-in-chrome__get_page_text` to read the sheet contents
5. Find the first row where column B (Status) = `queued`
6. If no queued topics found:
   - Log: "No queued topics found. Pipeline complete."
   - STOP
7. Extract the topic from column A of that row
8. Note the row number for later updates
9. Update status to `researching`:
   - Click on the Status cell for that row
   - Type `researching`
   - Press Enter

### Phase 1.5: Research Topic

Before generating content, research every product, tool, and technology mentioned in the topic to ensure factual accuracy.

1. **Parse the topic** for product/tool names — identify every tool, framework, API, or service mentioned or implied by the topic.

2. **Research each product/tool** using `WebSearch` and `WebFetch`:
   - Search for `"{tool name}" official documentation`
   - Search for `"{tool name}" features pricing {current year}`
   - Look for recent announcements or changelogs
   - Fetch key pages from official docs
   - Priority: official docs > release announcements > technical blogs > community posts

3. **Known documentation URLs** — check these first for common tools:

   | Tool | Documentation URL |
   |------|------------------|
   | Claude Code | https://docs.anthropic.com/en/docs/claude-code |
   | Cursor | https://docs.cursor.com |
   | Vercel | https://vercel.com/docs |
   | Supabase | https://supabase.com/docs |
   | Next.js | https://nextjs.org/docs |
   | Trigger.dev | https://trigger.dev/docs |
   | Modal | https://modal.com/docs |
   | OpenAI | https://platform.openai.com/docs |
   | Gemini | https://ai.google.dev/docs |

4. **Compile research notes** into a structured summary:
   - Exact feature names and capabilities for each tool
   - Current pricing (with date checked)
   - Context windows, model names, API details
   - CLI commands, flags, and options
   - Benchmarks from official sources only

5. **Cross-reference claims** — any stat or feature comparison planned for the blog must come from a verified source. Do not rely on internal knowledge alone for specific numbers, features, or comparisons.

6. **Pass research notes** to Phase 2 as context for blog generation.

### Phase 2: Generate Blog Post

Update Sheet status to `generating`, then follow the `/blog-post` skill workflow non-interactively:

1. **Update Sheet status** to `generating`:
   - Click on the Status cell for the current row
   - Type `generating`
   - Press Enter
2. **Generate the slug** from the topic (kebab-case, concise)
3. **Check for duplicate slug**:
   ```bash
   ls /Users/tarekalaaddin/Projects/code/tarek-alaaddin/content/blog/ | grep "SLUG"
   ```
   If exists, append a number or modify the slug.

4. **Check featured post count**:
   ```bash
   grep -l "featured: true" /Users/tarekalaaddin/Projects/code/tarek-alaaddin/content/blog/*.mdx
   ```
   Keep max 2-3 featured posts. New pipeline posts are NOT featured by default.

5. **Generate the MDX blog post** following the blog-post skill's writing rules:
   - Frontmatter with all required fields (title, description, date, category, tags, image, published: true, featured: false)
   - Match Tarek's voice: conversational, direct, bold opinions, data-driven
   - 1500-3000 words, 8-15 sections
   - At least 2-3 Callout components
   - End with newsletter CTA
   - Write to `/Users/tarekalaaddin/Projects/code/tarek-alaaddin/content/blog/SLUG.mdx`

6. **Build and verify**:
   ```bash
   cd /Users/tarekalaaddin/Projects/code/tarek-alaaddin && npx next build
   ```
   If build fails, fix the issue and rebuild. If it fails 3 times, mark as `failed` in the Sheet and STOP.

7. **Create branch, commit, push, and PR**:
   ```bash
   git checkout -b blog/SLUG
   git add content/blog/SLUG.mdx
   git commit -m "Add blog post: POST_TITLE"
   git push -u origin blog/SLUG
   gh pr create --title "Add blog post: SHORT_TITLE" --body "## Summary\n- New blog post: TITLE\n- Category: CATEGORY\n- Pipeline-generated\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)"
   ```

8. **Update Sheet**: Write the blog slug to column D for that row.

### Phase 3: Wait for PR Merge (Semi-Auto Gate)

This is the approval gate. The blog PR must be merged before social posting proceeds.

1. Check PR status every 5 minutes:
   ```bash
   gh pr view blog/SLUG --json state -q '.state'
   ```
2. If state is `MERGED`:
   - Continue to Phase 4
   - Update local main:
     ```bash
     git checkout main && git pull
     ```
3. If state is `CLOSED` (rejected):
   - Mark queue item as `failed` with note "PR was closed/rejected"
   - STOP
4. If state is `OPEN` after 24 hours:
   - Mark queue item as `failed` with note "PR not merged within 24h"
   - STOP
5. **For automated runs**: Poll using a loop with 5-minute sleep intervals
6. **For manual runs**: Tell the user "PR is open. Merge it when ready, then run `/pipeline-run` again to continue."

### Phase 4: Generate Social Media Copy

Read the blog post content to generate social copy:

```bash
cat /Users/tarekalaaddin/Projects/code/tarek-alaaddin/content/blog/SLUG.mdx
```

Generate the blog URL: `https://tarekalaaddin.com/blog/SLUG`

#### X/Twitter Copy (280 chars max)

Format:
```
[Hook — surprising stat, bold claim, or provocative question]

[1-2 sentence summary of the key insight]

[Blog URL]
```

Rules:
- Max 280 characters total (including URL)
- No hashtags on X (they hurt reach)
- Make the hook compelling enough to stop scrolling
- URL counts as ~23 characters (t.co shortening)

#### LinkedIn Copy (150-300 words)

Format:
```
[Hook line — this shows before "...see more", make it irresistible]

[Paragraph 2 — the problem or context]

[Paragraph 3 — the insight or solution]

[Paragraph 4 — personal experience or data point]

[CTA — question to drive engagement]

Read the full post: [Blog URL]

#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
```

Rules:
- First line is CRITICAL — it's what shows before the fold
- Use line breaks between every paragraph (LinkedIn formatting)
- 3-5 relevant hashtags at the end
- End with a question to drive comments
- Mention "link in comments" if you want to maximize reach (LinkedIn deprioritizes posts with links)

1. **Update Sheet**: Write X text to column F, LinkedIn text to column G
2. **Update status** to `generated`

### Phase 5: Post to X

1. Update Sheet status to `posting-x`
2. Invoke the `/post-to-x` skill logic:
   - Navigate to x.com/compose/post in a new tab
   - Type the tweet text
   - Take a pre-post screenshot (save to `logs/pipeline/screenshots/`)
   - Click Post
   - Wait 3 seconds
   - Take a post-post screenshot (save to `logs/pipeline/screenshots/`)
   - Verify success
3. If successful: Update Sheet status to `posted-x`
4. If failed: Update Sheet status to `failed`, write error to Notes column
5. **Update Sheet**: Write blog URL to column E

### Phase 6: Post to LinkedIn

1. Update Sheet status to `posting-linkedin`
2. Invoke the `/post-to-linkedin` skill logic:
   - Navigate to linkedin.com/feed in a new tab
   - Click "Start a post"
   - Type the LinkedIn post text
   - Take a pre-post screenshot
   - Click Post
   - Wait 3 seconds
   - Take a post-post screenshot
   - Verify success
3. If successful: Update Sheet status to `posted-linkedin`
4. If failed: Update Sheet status to `failed`, write error to Notes column

### Phase 7: Finalize

1. Update Sheet status to `done`
2. Write completion timestamp to Notes column
3. Log summary:
   - Topic processed
   - Blog URL
   - X post status
   - LinkedIn post status
   - Total time elapsed
4. Close all pipeline-opened tabs
5. Return to main branch:
   ```bash
   git checkout main
   ```

## Safety Checks

| Check | When | Action on Failure |
|-------|------|-------------------|
| Git repo is clean | Phase 0 | Stash changes or STOP |
| No duplicate slug | Phase 2 | Modify slug |
| Build passes | Phase 2 | Fix or mark failed |
| PR is merged | Phase 3 | Wait or mark failed |
| Logged into X | Phase 5 | Skip X, continue to LinkedIn |
| Logged into LinkedIn | Phase 6 | Skip LinkedIn, update status |
| Sheet is accessible | Phase 1 | STOP with error |

## Rate Limiting

- Max 2 pipeline runs per day
- Min 2 hours between runs
- The orchestrator shell script (`scripts/pipeline-orchestrator.sh`) enforces this at the scheduling level

## Dry Run Mode

When invoked with `dry-run`:
- Phases 0-2 run normally (blog post is generated, branch + PR created)
- Phase 3 skips PR wait
- Phases 5-6 skip actual posting (screenshots are still taken of the compose view)
- Phase 7 marks status as `dry-run-complete` instead of `done`

## Error Recovery

If the pipeline fails mid-run:
1. Check the Sheet for the current status of the failed row
2. The status indicates which phase failed
3. Fix the issue and re-run — the pipeline will resume from the failed phase based on status:
   - `researching` → restart from Phase 1.5
   - `generating` → restart from Phase 2
   - `generated` → restart from Phase 4
   - `posted-x` → restart from Phase 6
   - `posting-x` or `posting-linkedin` → retry that phase

## Logging

All output is logged to `logs/pipeline/` with timestamped filenames:
- `YYYYMMDD-HHMMSS-run.log` — full pipeline output
- `screenshots/YYYYMMDD-HHMMSS-x-pre.png` — pre-post X screenshot
- `screenshots/YYYYMMDD-HHMMSS-x-post.png` — post-post X screenshot
- `screenshots/YYYYMMDD-HHMMSS-linkedin-pre.png` — pre-post LinkedIn screenshot
- `screenshots/YYYYMMDD-HHMMSS-linkedin-post.png` — post-post LinkedIn screenshot
