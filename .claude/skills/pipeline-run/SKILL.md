---
name: pipeline-run
description: "Fully autonomous content pipeline - imports tagged ideas from ExpandNote into the Notion content queue, generates a blog post from the next queued topic, creates social media copy, posts to X and LinkedIn, and updates the queue status. Runs unattended as a scheduled task."
user-invocable: true
arguments: "optional: topic override to bypass queue, or dry-run to test without posting"
---

# Content Pipeline Runner

Master orchestrator for the blog-to-social-media pipeline. Imports content ideas captured in
ExpandNote into a Notion database queue, generates blog posts from that queue, creates social
media copy, and posts to X and LinkedIn.

**Idea capture happens in ExpandNote, not Notion.** Write a note in ExpandNote, tag it
`tarekalaaddin`, and the next run imports it into Notion as a `queued` row and marks the note
`done`. Notion stays the queue and the state store — every status, retry, and error still lives
there, and topics added directly in Notion still work exactly as before.

## Autonomous Execution

**This pipeline is designed to run fully autonomously as a scheduled task with no user present.** All required permissions are pre-configured in `.claude/settings.json`. Follow these rules at every phase:

- **NEVER ask for user confirmation or approval** — make the best decision and proceed
- **NEVER stop to ask clarifying questions** — use reasonable defaults
- **NEVER wait for user input** — if information is missing, use what's available or skip that step
- **On recoverable errors**: retry once, then skip and continue to the next phase
- **On unrecoverable errors**: update Notion status to `failed` with the error in Notes, log it, and stop gracefully
- **All tool permissions are pre-allowed** — do not expect permission prompts for Bash, MCP tools, file operations, WebSearch, or WebFetch

## Usage

- `/pipeline-run` — Process next queued topic from Notion
- `/pipeline-run dry-run` — Run the pipeline but skip actual posting (for testing)
- `/pipeline-run "How I use AI for productivity"` — Override queue with a specific topic

## Prerequisites

- **Notion MCP server**: Must be configured with `NOTION_TOKEN`
- **ExpandNote MCP server**: Provides the idea inbox (Phase 0.5). If unavailable, the pipeline
  falls back to the existing Notion queue — it does not fail.
- **Browser**: Chrome with Claude in Chrome extension active (preferred), OR Playwright MCP tools available (fallback) — only needed for social posting (Phases 5-6)
- User must be logged into X (x.com) and LinkedIn (linkedin.com)
- The project repo must be at `/Users/tarekalaaddin/Projects/code/tarek-alaaddin/`
- `gh` CLI must be authenticated for GitHub operations
- All tool permissions pre-configured in `.claude/settings.json` (Bash, MCP, file ops, web research)

## References

Load these as needed during the relevant phase:

- **`references/expandnote-inbox.md`** — ExpandNote tag IDs, query/import/tag-swap patterns, failure handling (needed for Phase 0.5)
- **`references/browser-automation.md`** — Browser backend detection, tool mapping table, Playwright setup (needed for Phase 0, 5, 6)
- **`references/notion-api.md`** — Database schema, API curl patterns, status flow, adding topics (needed for all phases)
- **`references/critique-process.md`** — Full Phase 2.5 critique workflow with sub-agent dispatch (needed for Phase 2.5)
- **`references/social-copy-formats.md`** — X/Twitter and LinkedIn copy formats and rules (needed for Phase 4)

## Process

### Phase 0: Pre-Flight Checks

1. **Load environment variables** — ensure `NOTION_TOKEN` is available:
   ```bash
   source /Users/tarekalaaddin/projects/code/tarek-alaaddin/.env.local
   export NOTION_TOKEN
   ```
   This also exports `ANTHROPIC_API_KEY` and other keys needed by sub-agents.

2. **Verify Notion API access** — read `references/notion-api.md` for curl patterns:
   ```bash
   curl -s 'https://api.notion.com/v1/users/me' \
     -H "Authorization: Bearer $NOTION_TOKEN" \
     -H 'Notion-Version: 2022-06-28' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Notion connected: {d[\"name\"]}' if 'name' in d else 'ERROR: Notion auth failed')"
   ```
   If auth fails, STOP with error.

3. **Detect browser backend** — read `references/browser-automation.md` for detection logic and tool mapping.
   Log: "Using [Chrome Extension / Playwright] backend for social posting"

4. Check that the project repo is clean and auto-resolve if dirty:
   ```bash
   cd /Users/tarekalaaddin/projects/code/tarek-alaaddin && git status
   ```
   - If there are uncommitted changes: `git stash push -m "pipeline-auto-stash-$(date +%Y%m%d-%H%M%S)"`
   - Do NOT stop to ask the user — stash automatically and continue
5. Ensure we're on the `main` branch:
   ```bash
   git checkout main && git pull
   ```

6. **Initialize pipeline log file**:
   ```bash
   PIPELINE_LOG="logs/pipeline/$(date +%Y%m%d-%H%M%S)-run.log"
   ```
   All major actions should be logged with: `echo "[$(date +%H:%M:%S)] MESSAGE" >> "$PIPELINE_LOG"`

### Phase 0.5: Import Ideas from ExpandNote

Read `references/expandnote-inbox.md` for tag IDs, the exact query, the import payload, and the
tag-swap rules. This phase moves ideas from the ExpandNote inbox into the Notion queue. It
**never publishes** — publishing is still driven off the Notion queue in Phase 1.

**This phase is best-effort. Any failure here is logged and skipped, never fatal** — the pipeline
continues to Phase 1 and works the existing Notion backlog.

1. **Load the ExpandNote MCP tools** with a single `ToolSearch` call (see the reference for the
   exact `select:` string). If they fail to load, log
   `ExpandNote unavailable — falling back to Notion queue` and skip to Phase 1.

2. **Resolve tag IDs by name** via `list_tags` — get the UUIDs for `tarekalaaddin` and `done`.
   If either tag does not exist, create it with `create_tag` and continue.

3. **Query for tagged notes**: `search_notes(tag_ids=[<tarekalaaddin>], view="active", limit=100)`.
   - If zero results: log `ExpandNote inbox empty` and skip to Phase 1.
   - Drop any note with `is_locked: true` — log each one as skipped (see reference for why).
   - Sort the remainder oldest-first by `updated_at`.

4. **Import every tagged note** — all of them, not just one. Your ideas should never sit in the
   inbox. For each note, in order:

   a. `get_note(id)` for the full content and its current tag list (search results can truncate).

   b. **Dedup check** — query Notion for an existing row with
      `Source ID = "expandnote:<note uuid>"`. If one exists, skip to step (d): the row was
      created on an earlier run whose tag swap failed.

   c. **Create the Notion row**: Topic = note title (or derived from the first content line if
      the title is null/empty/"Untitled"), Status = `queued`, Date Queued = today, Source ID =
      `expandnote:<note uuid>`, and the note body as page-body paragraph blocks split into
      2000-char chunks. Build the payload with a Python heredoc, not shell interpolation.
      If this fails: log it, leave the note's tags untouched so it retries next run, continue
      to the next note.

   d. **Mark the note done**: `set_note_tags` with the note's existing tags minus
      `tarekalaaddin` plus `done`. This is a full replacement — preserve the other tags. Respect
      the 5-tag ceiling (see reference).

5. **Log the import summary**:
   ```bash
   echo "[$(date +%H:%M:%S)] ExpandNote import: N imported, M skipped (locked/duplicate)" >> "$PIPELINE_LOG"
   ```

Only one topic gets published per run. Everything else imported here waits in Notion as `queued`
and is picked up by the next scheduled run, oldest first.

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

7. **Personal-claim guard**: If `topic_context` does not contain Tarek-supplied first-person anecdotes or personal numbers, do NOT generate any in Phase 2. The blog can still take a strong opinion, but it cannot fabricate "I did X" stories or specific personal magnitudes ("47 hours saved", "tested 12 frameworks", "ran 700 experiments", "11% improvement on my training run"). Hooks must be sourced from the research log or framed as observation/industry pattern/question — never as invented personal experience. Specific numbers in the post must trace back to a research-log source; otherwise replace with a vague magnitude ("dozens", "noticeably faster") or remove.

### Phase 2: Generate Blog Post

1. Update Notion status to `generating`
2. Generate slug (kebab-case, concise). Check for duplicate slug in `content/blog/`.
3. Check featured post count — max 2-3 featured. New pipeline posts are NOT featured.
4. **Generate the MDX blog post**:
   - Use topic + topic_context + research notes as input
   - Frontmatter: title, description, date, category, tags, image, published: true, featured: false
   - Voice: conversational, direct, bold opinions; **data-driven only with sourced numbers**. Do not invent first-person anecdotes or specific personal metrics — Tarek did not run "700 experiments last month." See Phase 1.5 step 7.
   - 1500-3000 words, 8-15 sections, 2-3 Callout components, newsletter CTA at end
   - **The newsletter CTA must link to `/subscribe`** — write it as `[Subscribe to the newsletter](/subscribe)` or similar wording, but the path is always `/subscribe`. There is no `/newsletter` route; it 404s. Seven published posts shipped with that broken link before the path was pinned here.
   - Write to `content/blog/SLUG.mdx`

### Phase 2.5: AI Content Critique

Read `references/critique-process.md` and follow the complete critique workflow:
- Dispatch parallel critics (Sonnet for voice/structure, Codex for factual accuracy)
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

### Phase 3: Merge PR

**Auto-merge is enabled.** After the build passes and the PR is created, merge it automatically without waiting for manual review.

1. Merge the PR:
   ```bash
   gh pr merge blog/SLUG --squash --delete-branch
   ```
2. Update local main:
   ```bash
   git checkout main && git pull origin main
   ```
3. If merge fails → mark status `failed` in Notion, STOP
4. Continue to Phase 4

### Phase 4: Generate Social Media Copy

Read `references/social-copy-formats.md` for format rules.

1. Read the blog post content from `content/blog/SLUG.mdx`
2. Generate blog URL: `https://tarekalaaddin.com/blog/SLUG`
3. Generate X/Twitter copy (280 chars max) and LinkedIn copy (150-300 words)
4. Update Notion with X Text, LinkedIn Text, Blog URL, and status = `generated`

### Phase 5: Post to X

1. Update Notion status to `posting-x`
2. Follow `/post-to-x` skill logic — use browser backend detected in Phase 0
3. Pass the X Text from Phase 4 directly — do NOT ask for input
4. If successful: update status to `posted-x`
5. If failed (login issue, browser error, etc.): log the error, update Notes with the failure reason, and **continue to Phase 6** — do NOT stop the pipeline

### Phase 6: Post to LinkedIn

1. Update Notion status to `posting-linkedin`
2. Follow `/post-to-linkedin` skill logic — use browser backend detected in Phase 0
3. Pass the LinkedIn Text from Phase 4 directly — do NOT ask for input
4. If successful: update status to `posted-linkedin`
5. If failed (login issue, browser error, etc.): log the error, update Notes with the failure reason, and **continue to Phase 7** — do NOT stop the pipeline

### Phase 7: Finalize

1. Update Notion status to `done` with completion timestamp
2. **Write pipeline summary to log file**:
   ```bash
   echo "[$(date +%H:%M:%S)] === PIPELINE COMPLETE ===" >> "$PIPELINE_LOG"
   echo "Topic: $TOPIC" >> "$PIPELINE_LOG"
   echo "Blog URL: https://tarekalaaddin.com/blog/$SLUG" >> "$PIPELINE_LOG"
   echo "X Post: [success/failed/skipped]" >> "$PIPELINE_LOG"
   echo "LinkedIn Post: [success/failed/skipped]" >> "$PIPELINE_LOG"
   ```
3. Close all pipeline-opened browser tabs
4. Return to main branch: `git checkout main`

## Safety Checks

All failure actions are designed to self-resolve without user intervention:

| Check | When | Action on Failure |
|-------|------|-------------------|
| Notion API is accessible | Phase 0 | Log error and STOP (unrecoverable) |
| Git repo is clean | Phase 0 | Auto-stash changes, continue |
| ExpandNote MCP available | Phase 0.5 | Log, skip import, fall back to Notion queue |
| ExpandNote note is locked | Phase 0.5 | Skip that note (cannot be marked done), log, continue |
| Duplicate Source ID in Notion | Phase 0.5 | Skip row creation, retry the tag swap only |
| Tag swap fails after row created | Phase 0.5 | Log loudly; Source ID guard prevents a duplicate next run |
| No duplicate slug | Phase 2 | Auto-append date suffix to slug |
| Build passes | Phase 2 | Auto-fix once, retry up to 3x, then mark `failed` |
| PR merge succeeds | Phase 3 | Mark `failed`, log error, STOP |
| Logged into X | Phase 5 | Skip X, log "skipped", continue to LinkedIn |
| Logged into LinkedIn | Phase 6 | Skip LinkedIn, log "skipped", update status |
| Critique score < 8 or CRITICAL issues | Phase 2.5 | Auto-revise up to 2x, then proceed regardless |
| Browser backend unavailable | Phase 0 | Skip social posting phases (5-6), mark `generated` |

## Dry Run Mode

When invoked with `dry-run`:
- Phase 0.5 queries ExpandNote and logs what *would* be imported, but creates no Notion rows and
  swaps no tags — a dry run must not consume ideas from the inbox
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
