---
name: pipeline-run
description: "Automated content pipeline - reads a topic from the Google Sheets queue, generates a blog post, creates social media copy, posts to X and LinkedIn, and updates the queue status. Can run fully automated via scheduler or manually."
user-invocable: true
arguments: "optional: topic override to bypass queue, or dry-run to test without posting"
---

# Content Pipeline Runner

Master orchestrator for the blog-to-social-media pipeline. Reads topics from a Google Sheets queue, generates blog posts, creates social media copy, and posts to X and LinkedIn.

## Usage

- `/pipeline-run` — Process next queued topic from Google Sheet
- `/pipeline-run dry-run` — Run the pipeline but skip actual posting (for testing)
- `/pipeline-run "How I use AI for productivity"` — Override queue with a specific topic

## Prerequisites

- **Browser**: Chrome with Claude in Chrome extension active (preferred), OR Playwright MCP tools available (fallback)
- User must be logged into:
  - Google Sheets (for the content queue)
  - X (x.com) for Twitter posting
  - LinkedIn (linkedin.com) for LinkedIn posting
- The project repo must be at `/Users/tarekalaaddin/Projects/code/tarek-alaaddin/`
- `gh` CLI must be authenticated for GitHub operations

## Browser Backend

The pipeline supports two browser automation backends. It will auto-detect which is available.

### Detection Logic

1. Try Chrome Extension first: call `mcp__claude-in-chrome__tabs_context_mcp`
2. If it responds successfully → use **Chrome Extension** backend
3. If it fails or is unavailable → use **Playwright** backend (call `mcp__plugin_playwright_playwright__browser_navigate` to verify it works)
4. Log which backend is active before proceeding

### Tool Mapping Reference

Use this table to pick the correct tool based on the active backend:

| Action | Chrome Extension | Playwright |
|--------|-----------------|------------|
| Get tab context | `tabs_context_mcp` | `browser_tabs` (action: list) |
| Create new tab | `tabs_create_mcp` | `browser_tabs` (action: new) |
| Navigate to URL | `navigate` | `browser_navigate` |
| Read page structure | `read_page` | `browser_snapshot` |
| Extract page text | `get_page_text` | `browser_snapshot` or `browser_evaluate` with `document.body.innerText` |
| Find element | `find` (natural language query) | `browser_snapshot` → find ref by role/text |
| Click element | `computer` (action: left_click) | `browser_click` (ref from snapshot) |
| Type text | `computer` (action: type) | `browser_type` (ref from snapshot) |
| Press key | `computer` (action: key) | `browser_press_key` |
| Take screenshot | `computer` (action: screenshot) | `browser_take_screenshot` |
| Wait | `computer` (action: wait) | `browser_wait_for` |
| Execute JS | `javascript_tool` | `browser_evaluate` |
| Fill form | `form_input` | `browser_fill_form` |

> **Playwright element interaction**: Unlike Chrome Extension's `find()` which accepts natural language queries, Playwright requires taking a `browser_snapshot` first, then using element `ref` IDs from the snapshot to interact. Always snapshot before clicking or typing.

### Playwright Prerequisites

- Playwright MCP server must be configured with `--user-data-dir` for login persistence
- **First-time setup**: Run the pipeline once, then log into Google Sheets, X, and LinkedIn manually in the Playwright browser window. Subsequent runs reuse the saved session.
- If sessions expire, log in again manually in the Playwright browser

## Google Sheet Setup

**Sheet URL**: `https://docs.google.com/spreadsheets/d/1xfPdknbYRaftoy-BndQp6rkT3NTaebfcyr9nXTqunPA/edit?gid=0#gid=0`

**Expected columns** (Row 1 = headers):

| A: Topic | B: Status | C: Date Queued | D: Blog Slug | E: Blog URL | F: X Text | G: LinkedIn Text | H: Notes |

**Status values flow**: `queued` → `researching` → `generating` → `critiquing` → `generated` → `posted-x` → `posted-linkedin` → `done`

**Sheet formatting**: Text wrapping should be OFF for columns F (X Text) and G (LinkedIn Text), with single-line row heights. Column A (Topic) keeps wrapping ON for readability. This ensures all rows are visible when navigating the sheet. Long content in F and G columns will overflow but won't expand row heights. The pipeline reads data via CSV export, so visual formatting does not affect functionality — these settings are purely for human readability.

On failure at any stage: status becomes `failed` and the error is written to the Notes column (H).

## Process

### Phase 0: Pre-Flight Checks

1. **Detect browser backend**:
   - Try Chrome Extension: call `tabs_context_mcp`
   - If connected → set backend = Chrome Extension, create a new tab
   - If not connected → set backend = Playwright, navigate to a test page (e.g. `https://www.google.com`) to verify Playwright is working
   - Log: "Using [Chrome Extension / Playwright] backend"
2. Verify the browser is responsive by loading a page
3. Check that the project repo is clean:
   ```bash
   cd /Users/tarekalaaddin/Projects/code/tarek-alaaddin && git status
   ```
4. Ensure we're on the `main` branch:
   ```bash
   git checkout main && git pull
   ```

### Phase 1: Read Queue from Google Sheet

1. **Fetch sheet data via CSV export** (reliable, avoids canvas rendering issues):
   - Navigate to: `https://docs.google.com/spreadsheets/d/1xfPdknbYRaftoy-BndQp6rkT3NTaebfcyr9nXTqunPA/export?format=csv`
   - The browser carries auth cookies, so this works even for private sheets
   - Extract the page text content (raw CSV)
   - Parse CSV: split by newlines, then by commas (handle quoted fields)
   - Build a row array: `[{row: N, topic: "...", status: "...", ...}, ...]`

2. **Find the first row where Status = `queued`**
   - Scan the parsed rows for the first with status column = `queued`

3. If no queued topics found:
   - Log: "No queued topics found. Pipeline complete."
   - STOP

4. Extract the topic and note the row number

5. **Navigate to the sheet UI** for status updates:
   - Navigate to the Google Sheet URL
   - Wait for load (3 seconds)
   - Click on cell B{row} (Status cell for the queued row)
   - Type `researching`
   - Press Enter
   - If a validation warning popup appears, dismiss it (click OK or press Escape)

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

### Phase 2.5: AI Content Critique

Evaluate the generated blog post using parallel sub-agents (Sonnet + Gemini) before building and creating the PR. Auto-revises content if issues are found.

**Critique file path**: `/tmp/pipeline-critique-SLUG.txt` (deterministic path using the blog slug — persists across tool invocations, no shell variable scoping issues).

1. **Update Sheet status** to `critiquing`:
   - Click on the Status cell for the current row
   - Type `critiquing`
   - Press Enter

2. **Load critique context**:
   - Read the generated MDX file from `/Users/tarekalaaddin/Projects/code/tarek-alaaddin/content/blog/SLUG.mdx`
   - Recall research notes from Phase 1.5
   - Read the 2 most recent published posts from `content/blog/` as voice/style references — extract a ~200-word excerpt from each to use as voice calibration in step 4

3. **Write blog content + research notes to the critique file**:
   ```bash
   cat > /tmp/pipeline-critique-SLUG.txt << 'CRITIQUEOF'
   === BLOG POST ===
   <full MDX content from step 2>

   === RESEARCH NOTES ===
   <research notes summary from Phase 1.5>
   CRITIQUEOF
   ```
   Verify the file was written:
   ```bash
   wc -w /tmp/pipeline-critique-SLUG.txt
   ```

4. **Dispatch parallel sub-agents** — launch BOTH in a SINGLE message:

   > **Sub-agent failure handling**: If one agent fails or returns a malformed response (missing SCORE line), proceed with the other agent's results alone. Only fail the critique phase if BOTH agents fail. Parse SCORE as integer; if non-numeric, treat as 5 (neutral).

   **Sonnet — Content Quality, Voice & Structure:**
   ```
   Tool: Task
   subagent_type: "general-purpose"
   model: "sonnet"
   max_turns: 3
   description: "Sonnet content critique"
   prompt: |
     You are a senior content editor. Critique this blog post across these dimensions:

     **a) Voice & Writing Quality:**
     - Matches target voice: conversational, direct, bold opinions, data-driven
     - No AI-writing cliches ("In today's rapidly evolving...", "It's worth noting...", "In conclusion...")
     - Strong hook in first paragraph, engaging section headers
     - Variety in sentence length and structure
     - Compare against these reference posts for voice calibration:
       --- Reference Post 1 excerpt ---
       <inline the ~200-word excerpt from reference post 1 here>
       --- Reference Post 2 excerpt ---
       <inline the ~200-word excerpt from reference post 2 here>

     **b) Structure & MDX:**
     - Frontmatter has all required fields (title, description, date, category, tags, image, published: true, featured: false)
     - 8-15 sections, 1500-3000 words, 2-3 Callout components with varied types
     - Code blocks have language annotations
     - Ends with newsletter CTA

     **c) SEO & Discoverability:**
     - Title 50-70 characters, includes primary keyword
     - Description 150-160 characters
     - H2s include relevant search terms
     - Tags are specific and discoverable

     **d) Technical Accuracy** (if topic is technical):
     - Code examples syntactically correct
     - CLI commands use correct flags
     - No contradictions within the post

     Format response as:
     SCORE: [1-10]
     REVISION_REQUIRED: [YES/NO]

     CRITICAL (must fix):
     - [list with line references]

     WARNINGS (should fix):
     - [list with line references]

     SUGGESTIONS (nice to have):
     - [list]

     BLOG POST:
     <paste full MDX content here>
   ```

   **Gemini — Factual Accuracy** (haiku orchestrates the Bash call; Gemini runs via CLI):
   ```
   Tool: Task
   subagent_type: "Bash"
   model: "haiku"
   max_turns: 2
   description: "Gemini factual accuracy check"
   prompt: |
     Run this command and return the COMPLETE output:

     gemini -p "You are a fact-checker. Review this blog post against the research notes provided.
     Cross-reference EVERY specific claim (prices, features, dates, versions, stats, comparisons)
     against the research notes. Flag:
     - CRITICAL: Claims that contradict the research notes (wrong facts)
     - WARNING: Claims not supported by research notes (unverified)
     - INFO: Claims that could be more specific

     Format: List each finding with the claim text and your assessment.
     End with: SCORE: [1-10]" < "/tmp/pipeline-critique-SLUG.txt" || echo "GEMINI_FAILED: gemini CLI returned non-zero exit code"

     Replace SLUG in the file path with the actual blog slug.
     Return the full output. If the command fails, return the error message.
   ```

5. **Collect results and synthesize critique report**:

   After both agents return, synthesize. Parse `SCORE:` from each agent's output as an integer. If a score is missing or non-numeric, default to 5.

   ```
   CONTENT CRITIQUE REPORT
   ========================
   Sonnet Score: [N]/10
   Gemini Score: [N]/10
   Overall Score: [average of both scores, rounded]
   Revision Required: [YES if either agent says YES or any CRITICAL issues]

   CRITICAL:
   - [deduplicated list from both agents]

   WARNINGS:
   - [deduplicated list from both agents]

   SUGGESTIONS:
   - [deduplicated list]
   ```

   If one agent failed, note it and use only the successful agent's score as the overall score.

   Decision:
   - Score >= 8 AND no CRITICAL issues → **PASS** → skip to step 8
   - Otherwise → **REVISE** → continue to step 6

6. **Auto-revise** (max 2 cycles):
   - Read the current MDX file
   - Apply all CRITICAL fixes first, then WARNINGS
   - Rewrite MDX file to the same path
   - **Verify word count** after each revision:
     ```bash
     wc -w /Users/tarekalaaddin/Projects/code/tarek-alaaddin/content/blog/SLUG.mdx
     ```
     If word count dropped below 1500, revert the revision and proceed with the pre-revision version.
   - Update the critique file with the revised content:
     ```bash
     cat > /tmp/pipeline-critique-SLUG.txt << 'CRITIQUEOF'
     === BLOG POST ===
     <revised MDX content>

     === RESEARCH NOTES ===
     <same research notes>
     CRITIQUEOF
     ```
   - Re-dispatch sub-agents (repeat steps 4-5)
   - After 2 cycles: proceed regardless, flag remaining issues in the PR

   Guardrails:
   - Never reduce word count below 1500 (enforced by word count check above)
   - Never remove Callout components
   - Preserve overall section structure
   - Address specific findings, don't rewrite from scratch

7. **Record critique results** in Sheet Notes column (H):
   - Format: `Critique: PASSED on attempt {cycle_number}, Score: {overall_score}/10`
   - If warnings remain: append brief summary of unresolved warnings
   - Store the overall score and cycle number — these are used in the PR body (step 11)

8. **Cleanup critique file**:
   ```bash
   rm -f /tmp/pipeline-critique-SLUG.txt
   ```

9. **Proceed to build** (continue to step 10 below)

### Phase 2 (continued): Build, Branch & PR

10. **Build and verify**:
    ```bash
    cd /Users/tarekalaaddin/Projects/code/tarek-alaaddin && npx next build
    ```
    If build fails, fix the issue and rebuild. If it fails 3 times, mark as `failed` in the Sheet and STOP.

11. **Create branch, commit, push, and PR**:
    ```bash
    git checkout -b blog/SLUG
    git add content/blog/SLUG.mdx
    git commit -m "Add blog post: POST_TITLE"
    git push -u origin blog/SLUG
    ```
    Create the PR, substituting actual values from the critique report (step 7):
    - Replace `CRITIQUE_SCORE` with the overall score from step 7 (e.g., `8`)
    - Replace `CRITIQUE_ATTEMPT` with the cycle number from step 7 (e.g., `1`)
    - Replace `REMAINING_WARNINGS` with the list of unresolved warnings, or omit the section if none
    ```bash
    gh pr create --title "Add blog post: SHORT_TITLE" --body "$(cat <<'EOF'
    ## Summary
    - New blog post: TITLE
    - Category: CATEGORY
    - Pipeline-generated
    - Critique score: CRITIQUE_SCORE/10 (passed on attempt CRITIQUE_ATTEMPT)

    ## Remaining Critique Warnings
    REMAINING_WARNINGS

    🤖 Generated with [Claude Code](https://claude.com/claude-code)
    EOF
    )"
    ```
    If there are no remaining warnings, omit the "Remaining Critique Warnings" section entirely.

12. **Update Sheet**: Write the blog slug to column D for that row.

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
- Include 2-3 relevant hashtags at the end
- Hashtags count toward the 280 character limit
- Choose specific, discoverable hashtags (e.g., #ClaudeCode not #AI)
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
2. Invoke the `/post-to-x` skill logic (which also supports both browser backends):
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
2. Invoke the `/post-to-linkedin` skill logic (which also supports both browser backends):
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
| Critique score < 8 or has CRITICAL issues | Phase 2.5 | Auto-revise up to 2x, then proceed with warnings |
| Sheet is accessible | Phase 1 | STOP with error |

## Rate Limiting

- Max 3 pipeline runs per day
- Min 4 hours between runs
- The orchestrator shell script (`scripts/pipeline-orchestrator.sh`) enforces this at the scheduling level

## Dry Run Mode

When invoked with `dry-run`:
- Phases 0-2.5 run normally (blog post is generated, critiqued, branch + PR created). Note: critique phase runs in dry-run intentionally — this tests the full quality gate pipeline.
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
   - `critiquing` → restart from Phase 2.5 step 2 (re-read existing MDX and critique it, revision cycle count resets to 0)
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
