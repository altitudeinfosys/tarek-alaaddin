# AI Content Critique Process

Evaluate the generated blog post using two parallel critics — **Sonnet** for voice/structure/SEO
and **Codex** for factual accuracy — before building and creating the PR. Auto-revises content if
issues are found.

The two critics run on **different model families on purpose**. Sonnet judges the writing; Codex
independently checks the facts. Keeping the fact-checker off the Claude family is what makes the
fabrication guard meaningful.

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
  - Ends with a newsletter CTA, and that CTA links to `/subscribe` — flag any link to
    `/newsletter` as CRITICAL, it is a 404. A post with no CTA link at all is also a defect.

  **c) SEO & Discoverability:**
  - Title 50-70 characters, includes primary keyword
  - Description 150-160 characters
  - H2s include relevant search terms
  - Tags are specific and discoverable

  **d) Technical Accuracy** (if topic is technical):
  - Code examples syntactically correct
  - CLI commands use correct flags
  - No contradictions within the post

  **e) Fabrication check (CRITICAL severity — be strict):**
  - Flag every first-person anecdote, e.g. "Last month I…", "Yesterday I watched…", "I ran X tests", "A client told me…", "I saved X hours". For each, check whether the research notes or topic_context contain supporting evidence (a real artifact Tarek supplied, a sourced quote, a public link). If not → CRITICAL: fabricated personal anecdote.
  - Flag every specific number that does not appear in the research notes — counts ("700 experiments", "47 frameworks", "20 optimizations"), percentages ("11% improvement", "3x faster"), durations ("saved 3 hours/day", "in two days"), and similar magnitudes. Vague magnitudes ("dozens", "a handful", "noticeably faster", "a meaningful share") are fine. Specific magnitudes without a sourced citation → CRITICAL: unsourced specific number.
  - The bar is strict. Example: *"Last month I watched an AI agent run 700 experiments in two days. It discovered 20 optimizations that improved language model training performance by 11%."* — this is CRITICAL on every count unless the research notes explicitly contain it.

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

### Codex — Factual Accuracy

The fact-checker deliberately runs on a **different model family than the writer**. Claude and
GPT fabricate differently, so a non-Claude critic catches invented anecdotes and unsourced
numbers that a Claude critic reading Claude's prose tends to wave through. Do not "simplify"
this by replacing it with another Claude sub-agent — that defeats the entire purpose of the
step. (Gemini filled this role previously; it was swapped out because its CLI sat
unauthenticated for months and silently degraded the gate to a single critic.)

Run the Bash command directly and capture the complete output. `codex exec -` reads the prompt
and the post from stdin.

**Run it from a scratch directory, never from the repo.** Codex may write files of its own —
on 2026-08-19 it dropped a `chatgpt-work-fact-check.html` report into the repo root, which an
unattended run would have committed straight into the blog PR. Pin its working directory outside
the repo first, and tell it not to create files:

```bash
CRITIQUE_WORKDIR="$(mktemp -d)"
```

The critique file lives in `/tmp` and is passed on stdin, so nothing the checker needs is in the
repo anyway. After the run, confirm the tree is still clean before committing:

```bash
git status --porcelain   # must show only the intended content/blog/SLUG.mdx
```

```bash
{
cat <<'PROMPT'
You are a fact-checker for an OPINION blog. The author is expected to argue, generalize,
and state strong views. Your job is NOT to police opinion - it is to catch two things:
wrong external facts, and invented experience.

Check every VERIFIABLE EXTERNAL claim (prices, features, real-world dates, version numbers,
statistics, benchmarks, product comparisons) against the research notes:
- CRITICAL: contradicts the research notes, or misattributes a statistic
- WARNING: a checkable external fact with no support in the research notes
- INFO: correct but imprecise, e.g. needs attribution

Fabrication scan - the two things that must never be invented:
- First-person experience presented as real ("Last month I...", "I ran X tests",
  "A client told me..."). Unsupported -> CRITICAL.
- Specific quantitative claims about the real world. Unsupported -> CRITICAL.

DO NOT FLAG (flagging these is an error):
- Frontmatter metadata (title, description, date, category, tags, image, published, featured)
- Rhetorical/hypothetical framing aimed at the reader ("the skill you wrote six months ago",
  "if you wrote this in late 2025"), example code, sample prompts, hypothetical scenarios
- Opinion, argument, prediction, advice, and rhetorical prevalence claims
  ("most people never look", "almost nobody works this way") - these are the author's
  viewpoint in an opinion piece, NOT factual claims requiring a citation
- Section numbering, list counters, ordinal labels
- Vague magnitudes ("dozens", "a handful", "noticeably faster") and round rhetorical
  figures used as illustration ("turn forty")

SCORING RUBRIC - score ONLY on factual accuracy and fabrication:
- 10 = no factual errors, no fabrication, all statistics correctly attributed
- 8-9 = factually sound; at most minor attribution/precision nits (INFO)
- 6-7 = one or more checkable external facts unsupported (WARNING), nothing contradicted
- 3-5 = a stated fact contradicts the sources, or a statistic is misattributed
- 1-2 = fabricated personal experience, or invented numbers
Opinion and rhetoric MUST NOT lower the score. A post that is entirely opinion with
zero factual errors scores 10.
Reply with prose only - do NOT create, write, or edit any files.
End your reply with a final line of exactly: SCORE: <single integer 1-10>
PROMPT
cat "/tmp/pipeline-critique-SLUG.txt"
} | (cd "$CRITIQUE_WORKDIR" && codex exec --skip-git-repo-check - 2>&1) \
  || echo "CODEX_FAILED: codex CLI returned non-zero exit code"
```

Replace `SLUG` with the actual blog slug.

**Every one of those DO-NOT-FLAG exclusions and the rubric itself are load-bearing.** Without
them the checker flags the frontmatter date and rhetorical framing as CRITICAL fabrications and
scores an accurate opinion post at 5 — below the gate — sending every post into pointless
revision cycles. This prompt was calibrated against a real post: it moved from 5 with false
CRITICALs to 7 with a clean fabrication scan and no false positives.

**Parsing the score**: `codex exec` echoes the prompt back and prints a `tokens used` footer, so
`SCORE:` appears more than once in the output. Always take the **last** match of
`SCORE:\s*(\d+)`. The echoed prompt line reads `SCORE: <single integer 1-10>`, which is
non-numeric and will not match a digit-anchored regex.

**Cost**: roughly 60k tokens per fact-check on a ~2,200-word post. Budget for it.

## Step 5: Collect Results and Synthesize Critique Report

After both agents return, synthesize. Parse `SCORE:` from each agent's output as an integer —
for Codex, take the **last** `SCORE:\s*(\d+)` match (see the parsing note above). If a score is
missing or non-numeric, default to 5.

```
CONTENT CRITIQUE REPORT
========================
Sonnet Score: [N]/10
Codex Score: [N]/10
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
- **Fabrication fixes**: replace fabricated first-person anecdotes with generic framing or a sourced industry observation (e.g., rewrite "Last month I watched an AI agent run 700 experiments" as "There's a growing pattern of agents running large autonomous experiment loops — Karpathy's `nanochat` is a recent public example."). Replace unsourced specific numbers with vague magnitudes ("dozens", "a noticeable share", "noticeably faster") or remove the claim entirely. **Do not "fix" by inventing a different specific number** — if you don't have a real source, don't write a number.

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
