# AI Content Critique Process

Evaluate the generated blog post using parallel sub-agents (Sonnet + Gemini) before building and creating the PR. Auto-revises content if issues are found.

**Critique file path**: `/tmp/pipeline-critique-SLUG.txt` (deterministic path using the blog slug — persists across tool invocations, no shell variable scoping issues).

## Step 1: Update Notion Status

Update status to `critiquing`:
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/PAGE_ID" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{"properties": {"Status": {"select": {"name": "critiquing"}}}}'
```

## Step 2: Load Critique Context

- Read the generated MDX file from `/Users/tarekalaaddin/Projects/code/tarek-alaaddin/content/blog/SLUG.mdx`
- Recall research notes from Phase 1.5
- Read the 2 most recent published posts from `content/blog/` as voice/style references — extract a ~200-word excerpt from each to use as voice calibration in step 4

## Step 3: Write Blog Content + Research Notes to Critique File

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

## Step 4: Dispatch Parallel Sub-Agents

Launch BOTH in a SINGLE message.

> **Sub-agent failure handling**: If one agent fails or returns a malformed response (missing SCORE line), proceed with the other agent's results alone. Only fail the critique phase if BOTH agents fail. Parse SCORE as integer; if non-numeric, treat as 5 (neutral).

### Sonnet — Content Quality, Voice & Structure

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

### Gemini — Factual Accuracy

Haiku orchestrates the Bash call; Gemini runs via CLI:
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

## Step 5: Collect Results and Synthesize Critique Report

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

## Step 6: Auto-Revise (max 2 cycles)

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

## Step 7: Record Critique Results in Notion

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/PAGE_ID" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{"properties": {"Notes": {"rich_text": [{"text": {"content": "Critique: PASSED on attempt CYCLE, Score: SCORE/10. WARNINGS_SUMMARY"}}]}}}'
```
Store the overall score and cycle number — these are used in the PR body.

## Step 8: Cleanup

```bash
rm -f /tmp/pipeline-critique-SLUG.txt
```

Proceed to build step.
