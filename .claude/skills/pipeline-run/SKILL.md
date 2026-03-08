---
name: pipeline-run
description: "Automated content pipeline - reads a topic from the Notion content queue, generates a blog post, creates social media copy, posts to X and LinkedIn, and updates the queue status."
user-invocable: true
arguments: "optional: topic override to bypass queue, or dry-run to test without posting"
---

# Content Pipeline Runner

Master orchestrator for the blog-to-social-media pipeline. Reads topics from a Notion database queue, generates blog posts, creates social media copy, and posts to X and LinkedIn.

## Usage

- `/pipeline-run` — Process next queued topic from Notion
- `/pipeline-run dry-run` — Run the pipeline but skip actual posting (for testing)
- `/pipeline-run "How I use AI for productivity"` — Override queue with a specific topic

## Prerequisites

- **Notion MCP server**: Must be configured with `NOTION_TOKEN`
- **Browser**: Chrome with Claude in Chrome extension active (preferred), OR Playwright MCP tools available (fallback) — only needed for social posting (Phases 5-6)
- User must be logged into X (x.com) and LinkedIn (linkedin.com)
- The project repo must be at `/Users/tarekalaaddin/Projects/code/tarek-alaaddin/`
- `gh` CLI must be authenticated for GitHub operations

## References

Load these as needed during the relevant phase:

- **`references/browser-automation.md`** — Browser backend detection, tool mapping table, Playwright setup (needed for Phase 0, 5, 6)
- **`references/notion-api.md`** — Database schema, API curl patterns, status flow, adding topics (needed for all phases)
- **`references/critique-process.md`** — Full Phase 2.5 critique workflow with sub-agent dispatch (needed for Phase 2.5)
- **`references/social-copy-formats.md`** — X/Twitter and LinkedIn copy formats and rules (needed for Phase 4)

## Process

### Phase 0: Pre-Flight Checks

1. **Verify Notion API access** — read `references/notion-api.md` for curl patterns:
   ```bash
   curl -s 'https://api.notion.com/v1/users/me' \
     -H "Authorization: Bearer $NOTION_TOKEN" \
     -H 'Notion-Version: 2022-06-28' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Notion connected: {d[\"name\"]}' if 'name' in d else 'ERROR: Notion auth failed')"
   ```
   If auth fails, STOP with error.

2. **Detect browser backend** — read `references/browser-automation.md` for detection logic and tool mapping.
   Log: "Using [Chrome Extension / Playwright] backend for social posting"

3. Check that the project repo is clean:
   ```bash
   cd /Users/tarekalaaddin/Projects/code/tarek-alaaddin && git status
   ```
4. Ensure we're on the `main` branch:
   ```bash
   git checkout main && git pull
   ```

### Phase 1: Read Queue from Notion

Read `references/notion-api.md` for query patterns.

1. Query the Notion database for the next queued topic (status = `queued`, sorted by Date Queued ascending, page_size 1)
2. Parse: extract `page_id` and `topic` from results. If empty → STOP.
3. Read the note body for rich context → store as **topic_context**
4. Update status to `researching`

### Phase 1.5: Research Topic

Before generating content, thoroughly research every product, tool, and technology mentioned in the topic. The Notion topic + context from the note body tells you *what* to research — this phase ensures every fact in the article is **current and verified from live sources**.

> **CRITICAL**: Do NOT rely on internal knowledge for specific facts (pricing, features, model names, API details, version numbers, benchmarks). Your training data has a cutoff and WILL be outdated. Every specific claim must come from a web page you actually visited during this phase.

**Step 0 — Get the current date**: Determine today's month and year. Include this in ALL search queries to surface the most recent information. Example: search for `"Claude Code features March 2026"` not just `"Claude Code features"`.

1. **Parse the topic AND topic_context** for every product, tool, framework, API, or service mentioned or implied.

2. **For each product/tool**, perform this research sequence:

   a. **Search with current date** using `WebSearch`:
      - `"{tool name}" {current month} {current year}` (general recency check)
      - `"{tool name}" features pricing {current year}`
      - `"{tool name}" changelog OR "what's new" OR release notes {current year}`
      - If comparison topic: `"{tool A}" vs "{tool B}" {current year}`

   b. **Actually visit and READ pages** using `WebFetch` — this is NOT optional:
      - Fetch the official docs page (use Known URLs table below if available)
      - Fetch at least 2-3 search results per tool — read them fully
      - Fetch any changelog / "what's new" / release notes page
      - Extract specific facts: exact names, numbers, dates, pricing tiers, API limits

   c. **Minimum research depth per tool**: 2 official doc pages read + 1 recent article or changelog. If a tool is central to the article topic, go deeper — 4-5 pages.

3. **Known documentation URLs** — fetch these FIRST for common tools:

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

4. **Compile a research log** with verified facts only:
   - For each source: URL, key facts extracted, date of source content
   - Flag any source older than 6 months — search again to check if info has changed
   - Prioritize sources from the last 3 months

5. **Staleness rule** — if you cannot find a current source (< 6 months old) for a specific claim, either:
   - Drop the claim from the article, OR
   - Include it with a caveat like "as of [date]" and note it may have changed

6. **Pass the research log** (with source URLs) to Phase 2 as context for blog generation. The blog must cite only facts from this log.

### Phase 2: Generate Blog Post

1. Update Notion status to `generating`
2. Generate slug (kebab-case, concise). Check for duplicate slug in `content/blog/`.
3. Check featured post count — max 2-3 featured. New pipeline posts are NOT featured.
4. **Generate the MDX blog post**:
   - Use topic + topic_context + research notes as input
   - Frontmatter: title, description, date, category, tags, image, published: true, featured: false
   - Voice: conversational, direct, bold opinions, data-driven
   - 1500-3000 words, 8-15 sections, 2-3 Callout components, newsletter CTA at end
   - Write to `content/blog/SLUG.mdx`

### Phase 2.5: AI Content Critique

Read `references/critique-process.md` and follow the complete critique workflow:
- Dispatch parallel sub-agents (Sonnet + Gemini)
- Synthesize scores, auto-revise if needed (max 2 cycles)
- Record results in Notion Notes property

### Phase 2 (continued): Build, Branch & PR

10. **Build and verify**:
    ```bash
    cd /Users/tarekalaaddin/Projects/code/tarek-alaaddin && npx next build
    ```
    If build fails 3 times, update Notion status to `failed` and STOP.

11. **Create branch, commit, push, and PR**:
    ```bash
    git checkout -b blog/SLUG
    git add content/blog/SLUG.mdx
    git commit -m "Add blog post: POST_TITLE"
    git push -u origin blog/SLUG
    ```
    Create PR with critique score and remaining warnings in the body.

12. **Update Notion**: Write blog slug to Blog Slug property.

### Phase 3: Wait for PR Merge (Semi-Auto Gate)

1. Check PR status every 5 minutes: `gh pr view blog/SLUG --json state -q '.state'`
2. `MERGED` → continue to Phase 4, update local main
3. `CLOSED` → mark failed, STOP
4. `OPEN` after 24h → mark failed, STOP
5. **For manual runs**: Tell user to merge, then re-run `/pipeline-run`

### Phase 4: Generate Social Media Copy

Read `references/social-copy-formats.md` for format rules.

1. Read the blog post content from `content/blog/SLUG.mdx`
2. Generate blog URL: `https://tarekalaaddin.com/blog/SLUG`
3. Generate X/Twitter copy (280 chars max) and LinkedIn copy (150-300 words)
4. Update Notion with X Text, LinkedIn Text, Blog URL, and status = `generated`

### Phase 5: Post to X

1. Update Notion status to `posting-x`
2. Follow `/post-to-x` skill logic — use browser backend detected in Phase 0
3. If successful: update status to `posted-x`
4. If failed: update status to `failed` with error in Notes

### Phase 6: Post to LinkedIn

1. Update Notion status to `posting-linkedin`
2. Follow `/post-to-linkedin` skill logic — use browser backend detected in Phase 0
3. If successful: update status to `posted-linkedin`
4. If failed: update status to `failed` with error in Notes

### Phase 7: Finalize

1. Update Notion status to `done` with completion timestamp
2. Log summary: topic, blog URL, X/LinkedIn post status, total time
3. Close all pipeline-opened browser tabs
4. Return to main branch: `git checkout main`

## Safety Checks

| Check | When | Action on Failure |
|-------|------|-------------------|
| Notion API is accessible | Phase 0 | STOP with error |
| Git repo is clean | Phase 0 | Stash changes or STOP |
| No duplicate slug | Phase 2 | Modify slug |
| Build passes | Phase 2 | Fix or mark failed |
| PR is merged | Phase 3 | Wait or mark failed |
| Logged into X | Phase 5 | Skip X, continue to LinkedIn |
| Logged into LinkedIn | Phase 6 | Skip LinkedIn, update status |
| Critique score < 8 or CRITICAL issues | Phase 2.5 | Auto-revise up to 2x, then proceed |

## Dry Run Mode

When invoked with `dry-run`:
- Phases 0-2.5 run normally (blog post generated, critiqued, branch + PR created)
- Phase 3 skips PR wait
- Phases 5-6 skip actual posting (screenshots still taken)
- Phase 7 marks status as `dry-run-complete` instead of `done`

## Error Recovery

The status in Notion indicates which phase failed. Fix the issue and re-run:
- `researching` → restart from Phase 1.5
- `generating` → restart from Phase 2
- `critiquing` → restart from Phase 2.5
- `generated` → restart from Phase 4
- `posted-x` → restart from Phase 6
- `posting-x` or `posting-linkedin` → retry that phase

## Logging

All output logged to `logs/pipeline/` with timestamped filenames:
- `YYYYMMDD-HHMMSS-run.log` — full pipeline output
- `screenshots/YYYYMMDD-HHMMSS-{platform}-{pre|post}.png` — social post screenshots
