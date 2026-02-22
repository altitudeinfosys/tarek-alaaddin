# Content Pipeline — Complete Setup & Operations Guide

> Automated blog-to-social-media pipeline: enter topics in a queue, auto-generate blog posts, and auto-post to X and LinkedIn using browser automation.

## How It Works (The Big Picture)

```
You add a topic to Google Sheets
         |
  [launchd triggers daily at 7:55am]
         |
  [pipeline-orchestrator.sh picks 2 random times between 8am-10pm]
         |
  [At each time, invokes: claude -p "Run /pipeline-run"]
         |
  /pipeline-run skill executes 8 phases:
         |
    1.   Read next "queued" topic from Google Sheet
    1.5. Research the topic — visit official docs for every tool/product mentioned
    2.   Generate a full blog post (MDX), create branch + PR
    3.   Wait for you to merge the PR (safety gate)
    4.   Generate social media copy (tweet + LinkedIn post)
    5.   Post to X via Chrome browser automation
    6.   Post to LinkedIn via Chrome browser automation
    7.   Update Google Sheet status to "done"
```

**Key insight**: We use Chrome browser automation (Claude in Chrome extension) instead of platform APIs. This means:
- $0/month for X posting (their API costs $200/mo)
- $0/month for LinkedIn posting (their API prohibits posting)
- No API keys to manage for social platforms

---

## Architecture Diagram

Open the Excalidraw file for a visual flow diagram:
```
docs/content-pipeline-flow.excalidraw
```
Open at [excalidraw.com](https://excalidraw.com) or in VS Code with the Excalidraw extension.

---

## What's Already Built

### Files in the Repo

| File | Purpose |
|------|---------|
| `.claude/skills/pipeline-run/SKILL.md` | Master orchestrator skill (7-phase pipeline) |
| `.claude/skills/post-to-x/SKILL.md` | X/Twitter posting via browser automation |
| `.claude/skills/post-to-linkedin/SKILL.md` | LinkedIn posting via browser automation |
| `scripts/pipeline-orchestrator.sh` | Shell script: daily scheduling + Claude CLI invocation |
| `logs/pipeline/` | Pipeline logs directory |
| `logs/pipeline/screenshots/` | Pre/post screenshots of each social post |

### Files on Your Machine (not in repo)

| File | Purpose |
|------|---------|
| `~/Library/LaunchAgents/com.tarek.content-pipeline.plist` | macOS scheduled job (7:55am daily) |

---

## Setup Steps

### Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it: **Content Pipeline Queue**
3. Set up Row 1 with these exact headers:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Topic | Status | Date Queued | Blog Slug | Blog URL | X Text | LinkedIn Text | Notes |

4. Format column B (Status) with data validation:
   - Select column B (below header)
   - Data → Data validation → Dropdown
   - Add values: `queued`, `researching`, `generating`, `generated`, `posted-x`, `posted-linkedin`, `done`, `failed`

5. **Copy the Sheet URL** — you'll need this. It looks like:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

6. **Bookmark it** in Chrome so the pipeline can find it easily.

### Step 2: Verify Chrome Setup

The pipeline uses the **Claude in Chrome** extension for browser automation.

1. **Install the extension** if not already: search "Claude in Chrome" in the Chrome Web Store
2. **Log into these sites** in Chrome (and stay logged in):
   - [x.com](https://x.com) — your X/Twitter account
   - [linkedin.com](https://linkedin.com) — your LinkedIn account
   - [sheets.google.com](https://sheets.google.com) — your Google account
3. **Keep Chrome running** — the pipeline needs it open

### Step 3: Verify Claude Code CLI

```bash
# Check Claude Code is installed
claude --version

# Check GitHub CLI is authenticated
gh auth status

# Check you're in the right repo
cd /Users/tarekalaaddin/Projects/code/tarek-alaaddin
git status
```

### Step 4: Update the Pipeline Skill with Your Sheet URL

Edit `.claude/skills/pipeline-run/SKILL.md` and update the Google Sheet URL reference in Phase 1. Currently it says "The content queue Google Sheet should be bookmarked or its URL stored" — replace this with your actual Sheet URL once created.

### Step 5: Test Each Component (Manual)

**Test in this order:**

#### 5a. Test `/post-to-x`
```
claude -p "/post-to-x This is a test tweet from my content pipeline"
```
- Verify: tweet appears on your X profile
- Check: screenshot saved in `logs/pipeline/screenshots/`

#### 5b. Test `/post-to-linkedin`
```
claude -p "/post-to-linkedin Testing my automated content pipeline. This is a test post - please ignore."
```
- Verify: post appears on your LinkedIn feed
- Check: screenshot saved in `logs/pipeline/screenshots/`

#### 5c. Test `/pipeline-run` (dry run)
1. Add a test topic to your Google Sheet:
   - Column A: `How to automate your content pipeline`
   - Column B: `queued`
   - Column C: today's date
2. Run:
   ```
   claude -p "/pipeline-run dry-run"
   ```
3. Verify:
   - Blog MDX was generated
   - PR was created on GitHub
   - Social copy was generated (but not posted)
   - Sheet status updated

#### 5d. Full test
1. Add another topic to the Sheet with status `queued`
2. Run:
   ```
   claude -p "Run /pipeline-run"
   ```
3. When the PR is created, review and merge it
4. Verify the pipeline continues and posts to X and LinkedIn
5. Check the Sheet — status should be `done`

### Step 6: Enable the Scheduler

Once manual testing passes:

```bash
# Load the launchd job (starts running tomorrow at 7:55am)
launchctl load ~/Library/LaunchAgents/com.tarek.content-pipeline.plist

# Verify it's loaded
launchctl list | grep content-pipeline
```

To check if it's working:
```bash
# View schedule log
cat logs/pipeline/schedule.log

# View the latest run log
ls -lt logs/pipeline/*.log | head -5
```

To stop the scheduler:
```bash
launchctl unload ~/Library/LaunchAgents/com.tarek.content-pipeline.plist
```

---

## Daily Operations

### Adding Topics to the Queue

1. Open the Google Sheet
2. Add a new row:
   - **Column A (Topic)**: Your topic idea (e.g., "Why every developer should learn prompt engineering")
   - **Column B (Status)**: `queued`
   - **Column C (Date Queued)**: Today's date
   - Leave all other columns blank — the pipeline fills them in

### What Happens Automatically

Each day at 7:55am, the orchestrator:
1. Picks 2 random times between 8am and 10pm (at least 2 hours apart)
2. At each time, runs the pipeline:
   - Finds the next `queued` topic
   - **Researches every product/tool** mentioned — visits official docs, verifies specs/pricing/features
   - Generates a blog post using verified research, creates a PR
   - Waits for you to merge the PR
   - Posts to X and LinkedIn
   - Marks the topic as `done`

### Your Only Manual Step (v1)

**Merge the PR.** The pipeline creates a blog post PR and waits for you to review and merge it. This is the safety gate — you review the content before it goes live.

The pipeline checks every 5 minutes for up to 24 hours. Once you merge, it automatically continues with social posting.

### Checking on the Pipeline

```bash
# Today's schedule
tail -20 logs/pipeline/schedule.log

# Latest run output
ls -lt logs/pipeline/*.log | head -3

# Check for any failures in the Sheet
# (look for status = "failed" with error in Notes column)
```

---

## Status Flow Reference

```
queued          → Topic is waiting to be processed
researching     → Visiting official docs and building a facts sheet
generating      → Blog post is being written (using verified research)
generated       → Blog post PR created, social copy ready
posted-x        → Tweet posted successfully
posted-linkedin → LinkedIn post posted successfully
done            → Everything completed successfully
failed          → Something went wrong (check Notes column for error)
```

---

## Error Recovery

| Situation | What to Do |
|-----------|------------|
| Status stuck on `researching` | The research phase failed. Check the run log. Fix the issue and change status back to `queued` to retry. |
| Status stuck on `generating` | The blog generation failed. Check the run log. Fix the issue and change status back to `queued` to retry. |
| Status stuck on `generated` | The PR wasn't merged within 24h. Either merge the PR or change status back to `queued`. |
| Status is `failed` | Read the Notes column for the error. Fix the issue and change status to `queued` to retry. |
| Social post failed | Check if you're still logged into X/LinkedIn in Chrome. Log back in and change status appropriately to retry that phase. |
| Chrome not running | The orchestrator script opens Chrome automatically. If it still fails, open Chrome manually. |
| Pipeline not running at all | Check `launchctl list | grep content-pipeline`. If not listed, reload the plist. |

---

## Safety Features

1. **Mandatory research phase** — Every blog post is fact-checked against official documentation before writing; no claims from internal knowledge alone
2. **PR approval gate** — Blog posts require your manual merge before social posting
3. **Login verification** — Screenshots taken before posting to verify login state
4. **Duplicate prevention** — Checks if a blog slug already exists before writing
5. **Rate limiting** — Max 2 posts per day, at least 2 hours apart
6. **Error isolation** — Each phase updates status independently; failures don't corrupt other queue items
7. **Audit trail** — Screenshots saved before and after every social post in `logs/pipeline/screenshots/`

---

## Mac Mini Migration

When you're ready to move this to a dedicated Mac Mini:

### Migration Checklist

1. **Clone the repo:**
   ```bash
   git clone https://github.com/altitudeinfosys/tarek-alaaddin.git
   cd tarek-alaaddin
   ```

2. **Install Claude Code CLI:**
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

3. **Set up environment variables:**
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export ANTHROPIC_API_KEY="your-key-here"
   ```

4. **Copy the launchd plist:**
   ```bash
   # From MacBook Pro:
   scp ~/Library/LaunchAgents/com.tarek.content-pipeline.plist macmini:~/Library/LaunchAgents/
   ```
   If the Mac Mini username differs, update paths in:
   - The plist file
   - `scripts/pipeline-orchestrator.sh` (the `REPO_DIR` variable)

5. **Install GitHub CLI:**
   ```bash
   brew install gh
   gh auth login
   ```

6. **Set up Chrome:**
   - Install Google Chrome
   - Install Claude in Chrome extension
   - Log into X, LinkedIn, and Google Sheets
   - Keep Chrome running

7. **Configure Mac Mini for always-on:**
   - System Settings → Energy Saver → Prevent automatic sleeping
   - System Settings → Lock Screen → set to Never (or a long interval)

8. **Test manually:**
   ```bash
   claude -p "Run /pipeline-run dry-run"
   ```

9. **Enable the scheduler:**
   ```bash
   launchctl load ~/Library/LaunchAgents/com.tarek.content-pipeline.plist
   ```

10. **Monitor the first few runs** by checking logs:
    ```bash
    tail -f logs/pipeline/schedule.log
    ```

---

## File Reference

### Repo Files

```
tarek-alaaddin/
├── .claude/skills/
│   ├── pipeline-run/SKILL.md     # Master orchestrator (7 phases)
│   ├── post-to-x/SKILL.md       # X posting via browser automation
│   └── post-to-linkedin/SKILL.md # LinkedIn posting via browser automation
├── scripts/
│   └── pipeline-orchestrator.sh  # Daily scheduler (random times)
├── logs/pipeline/
│   ├── .gitkeep
│   ├── schedule.log              # Daily schedule records
│   ├── YYYYMMDD-HHMMSS-run-N.log # Per-run Claude output
│   └── screenshots/
│       ├── .gitkeep
│       └── *.png                 # Pre/post social post screenshots
└── docs/
    ├── content-pipeline-flow.excalidraw  # Architecture diagram
    └── CONTENT-PIPELINE-SETUP.md         # This document
```

### Machine-Local Files

```
~/Library/LaunchAgents/
└── com.tarek.content-pipeline.plist  # macOS scheduled job
```

---

## Costs

| Component | Cost |
|-----------|------|
| X/Twitter posting | $0 (browser automation) |
| LinkedIn posting | $0 (browser automation) |
| Google Sheets | $0 |
| Infrastructure | $0 (runs on your Mac) |
| Claude Code CLI | Usage-based (Anthropic API) |
| **Total** | **~$0/month** + Claude API usage |

---

## Recent Improvements (v2)

- **Mandatory research phase**: Phase 1.5 visits official documentation for every tool/product mentioned before writing, building a verified facts sheet. Prevents factual errors from relying on stale internal knowledge.
- **Known docs URL table**: Common tools have pre-configured documentation URLs for faster lookup.

## Future Improvements (v3)

- **Full auto mode**: Remove the PR approval gate; add a self-review step instead
- **Blog image generation**: Auto-generate cover images using AI
- **Analytics tracking**: Add columns for post engagement metrics
- **Multi-platform**: Add Instagram, Threads, Bluesky
- **Content calendar**: Schedule topics for specific dates
- **A/B testing**: Generate multiple social copy variants and pick the best performer
