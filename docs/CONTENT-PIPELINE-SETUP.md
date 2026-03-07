# Content Pipeline — Complete Setup & Operations Guide

> Automated blog-to-social-media pipeline: enter topics in a queue, auto-generate blog posts, and auto-post to X and LinkedIn using browser automation.

## How It Works (The Big Picture)

```
You add a topic to the Notion "Content Pipeline" database
         |
  Run /pipeline-run manually or schedule via Claude Code Desktop
         |
  /pipeline-run skill executes 8 phases:
         |
    1.   Read next "queued" topic from Notion database (via API)
    1.5. Research the topic — visit official docs for every tool/product mentioned
    2.   Generate a full blog post (MDX), create branch + PR
    3.   Wait for you to merge the PR (safety gate)
    4.   Generate social media copy (tweet + LinkedIn post)
    5.   Post to X via Chrome browser automation
    6.   Post to LinkedIn via Chrome browser automation
    7.   Update Notion status to "done"
```

**Key insight**: We use Notion's API for queue management (fast, no browser needed) and Chrome browser automation for social posting. This means:
- $0/month for X posting (their API costs $200/mo)
- $0/month for LinkedIn posting (their API prohibits posting)
- No API keys to manage for social platforms
- Instant queue reads/updates via Notion API (no browser automation delays)

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
| `logs/pipeline/` | Pipeline logs directory |
| `logs/pipeline/screenshots/` | Pre/post screenshots of each social post |

---

## Setup Steps

### Step 1: Set Up Notion Database

The content queue lives in a Notion database (already created by the setup script).

**Database URL**: [Content Pipeline](https://www.notion.so/319610c68f04811ea752e9d0cee2f0d1)

**Database ID**: `319610c68f04811ea752e9d0cee2f0d1`

**Properties**:

| Property | Type | Purpose |
|----------|------|---------|
| Topic | title | The content idea to process |
| Status | select | Pipeline phase tracking (queued/researching/generating/critiquing/generated/posted-x/posted-linkedin/done) |
| Date Queued | date | When the topic was added |
| Blog Slug | rich_text | Auto-filled by pipeline |
| Blog URL | url | Auto-filled by pipeline |
| X Text | rich_text | Auto-generated tweet text |
| LinkedIn Text | rich_text | Auto-generated LinkedIn text |
| Notes | rich_text | Status updates and error messages |

**Notion Integration**: The "Claude Code Pipeline" integration must have access to the database. The integration token (`NOTION_TOKEN`) must be set as an environment variable.

### Step 2: Verify Chrome Setup

The pipeline uses the **Claude in Chrome** extension for browser automation (social posting only — queue management uses Notion API directly).

1. **Install the extension** if not already: search "Claude in Chrome" in the Chrome Web Store
2. **Log into these sites** in Chrome (and stay logged in):
   - [x.com](https://x.com) — your X/Twitter account
   - [linkedin.com](https://linkedin.com) — your LinkedIn account
3. **Keep Chrome running** — the pipeline needs it for social posting

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

### Step 4: Verify Notion MCP Server

The Notion MCP server should be configured in Claude Code:

```bash
# Check MCP server is configured
cat ~/.claude.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('Notion MCP:', 'configured' if 'notion' in d.get('mcpServers',{}) else 'NOT FOUND')"

# Test Notion API access
curl -s 'https://api.notion.com/v1/users/me' \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Connected as: {d[\"name\"]}')"
```

If not configured, run:
```bash
claude mcp add notion --scope user -e NOTION_TOKEN=ntn_YOUR_TOKEN -- npx -y @notionhq/notion-mcp-server
```

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
1. Add a test topic to the Notion Content Pipeline database:
   - Topic: `How to automate your content pipeline`
   - Status: `queued`
   - Date Queued: today's date
   - (Optional) Add context in the page body
2. Run:
   ```
   claude -p "/pipeline-run dry-run"
   ```
3. Verify:
   - Blog MDX was generated
   - PR was created on GitHub
   - Social copy was generated (but not posted)
   - Notion status updated

#### 5d. Full test
1. Add another topic to Notion with status `queued`
2. Run:
   ```
   claude -p "Run /pipeline-run"
   ```
3. When the PR is created, review and merge it
4. Verify the pipeline continues and posts to X and LinkedIn
5. Check Notion — status should be `done`

---

## Daily Operations

### Adding Topics to the Queue

1. Open the [Content Pipeline database in Notion](https://www.notion.so/319610c68f04811ea752e9d0cee2f0d1)
2. Click "New" to add a row:
   - **Topic**: Your topic idea (e.g., "Why every developer should learn prompt engineering")
   - **Status**: `queued`
   - **Date Queued**: Today's date
   - Leave all other properties blank — the pipeline fills them in
3. **(Optional but recommended)**: Open the page and add rich context in the body — links, references, specific angles to cover, competitor analysis, etc. This context is read by the pipeline and used to generate better, more informed content.

### Running the Pipeline

Run `/pipeline-run` manually or schedule via Claude Code Desktop. Each run:
1. Finds the next `queued` topic
2. **Researches every product/tool** mentioned — visits official docs, verifies specs/pricing/features
3. Generates a blog post using verified research, creates a PR
4. Waits for you to merge the PR
5. Posts to X and LinkedIn
6. Marks the topic as `done`

### Your Only Manual Step

**Merge the PR.** The pipeline creates a blog post PR and waits for you to review and merge it. This is the safety gate — you review the content before it goes live.

The pipeline checks every 5 minutes for up to 24 hours. Once you merge, it automatically continues with social posting.

### Checking on the Pipeline

```bash
# Latest run output
ls -lt logs/pipeline/*.log | head -3

# Check for any failures in Notion
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
| Status stuck on `researching` | The research phase failed. Check the run log. Fix the issue and change status back to `queued` in Notion to retry. |
| Status stuck on `generating` | The blog generation failed. Check the run log. Fix the issue and change status back to `queued` in Notion to retry. |
| Status stuck on `generated` | The PR wasn't merged within 24h. Either merge the PR or change status back to `queued` in Notion. |
| Status is `failed` | Read the Notes property for the error. Fix the issue and change status to `queued` in Notion to retry. |
| Social post failed | Check if you're still logged into X/LinkedIn in Chrome. Log back in and change status appropriately to retry that phase. |
| Chrome not running | The orchestrator script opens Chrome automatically. If it still fails, open Chrome manually. |
| Pipeline not running at all | Run `/pipeline-run` manually or schedule via Claude Code Desktop. |

---

## Safety Features

1. **Mandatory research phase** — Every blog post is fact-checked against official documentation before writing; no claims from internal knowledge alone
2. **PR approval gate** — Blog posts require your manual merge before social posting
3. **Login verification** — Screenshots taken before posting to verify login state
4. **Duplicate prevention** — Checks if a blog slug already exists before writing
5. **Rate limiting** — Max 3 posts per day
6. **Error isolation** — Each phase updates status independently; failures don't corrupt other queue items
7. **Audit trail** — Screenshots saved before and after every social post in `logs/pipeline/screenshots/`

---

## Mac Mini Setup Guide

Complete step-by-step guide for setting up the content pipeline on a dedicated Mac Mini.

### Prerequisites

Before starting, have these ready:
- Mac Mini connected to power, display, keyboard, and internet
- Your Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))
- Your GitHub account credentials
- Your X (Twitter), LinkedIn, and Google account credentials

### Step 1: Install Homebrew

```bash
# Check if Homebrew is already installed
brew --version

# If not installed, install it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Follow the post-install instructions to add Homebrew to your PATH
# (usually involves adding a line to ~/.zprofile)
```

### Step 2: Install Node.js and npm

```bash
# Install Node.js (includes npm)
brew install node

# Verify installation
node --version
npm --version
```

### Step 3: Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

### Step 4: Install GitHub CLI

```bash
brew install gh

# Authenticate with GitHub
gh auth login
# Select: GitHub.com → HTTPS → Yes (authenticate Git) → Login with a web browser
# Follow the browser prompts to complete authentication

# Verify
gh auth status
```

### Step 5: Clone the Repo

```bash
mkdir -p ~/Projects/code
cd ~/Projects/code
git clone https://github.com/altitudeinfosys/tarek-alaaddin.git
cd tarek-alaaddin

# Verify
git status
ls content/blog/
```

### Step 6: Set Environment Variables

```bash
# Open your shell profile
nano ~/.zshrc

# Add this line (replace with your actual key):
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Save and exit (Ctrl+O, Enter, Ctrl+X)

# Reload the profile
source ~/.zshrc

# Verify the key is set
echo $ANTHROPIC_API_KEY
```

### Step 7: Install Chrome + Claude in Chrome Extension

1. Download and install [Google Chrome](https://www.google.com/chrome/)
2. Open Chrome
3. Go to the Chrome Web Store and search for **"Claude in Chrome"**
4. Click **Add to Chrome** and confirm
5. Pin the extension to the toolbar for easy access

### Step 8: Log Into Social Platforms in Chrome

Open each of these in Chrome and log in. **Stay logged in** (don't sign out):

1. **X (Twitter)**: Go to [x.com](https://x.com) and log in with your account
2. **LinkedIn**: Go to [linkedin.com](https://linkedin.com) and log in with your account

Set the Notion API token as an environment variable:
```bash
# Add to ~/.zshrc:
export NOTION_TOKEN="ntn_your_token_here"
source ~/.zshrc
```

### Step 9: Configure Mac Mini for Always-On

The pipeline runs at scheduled times throughout the day, so the Mac Mini must never sleep.

1. **Prevent sleeping**:
   - System Settings → Energy Saver (or Battery → Options on laptops)
   - Set "Turn display off after" to **Never** (or a long interval like 3 hours — the pipeline doesn't need the display)
   - Enable **Prevent automatic sleeping when the display is off**
   - Enable **Start up automatically after a power failure**

2. **Disable screen lock** (optional, but prevents login screen blocking Chrome):
   - System Settings → Lock Screen
   - Set "Require password after screen saver begins or display is turned off" to **Never** (or a long interval)

3. **Enable auto-login** (so the pipeline starts after a reboot):
   - System Settings → Users & Groups → Automatic Login
   - Select your user account
   - Note: This requires FileVault to be off

4. **Keep Chrome running**:
   - Add Chrome to Login Items: System Settings → General → Login Items → Add Google Chrome
   - This ensures Chrome launches automatically on boot

### Step 10: Test Each Component Manually

Run these in order to verify everything works:

```bash
cd ~/Projects/code/tarek-alaaddin

# 1. Verify Claude Code can run
claude --version

# 2. Verify GitHub CLI
gh auth status

# 3. Test a simple Claude command
claude -p "Say hello"

# 4. Test the pipeline in dry-run mode (no actual posting)
claude -p "Run /pipeline-run dry-run"

# 5. If dry-run succeeds, test a full run with a test topic in Notion
# (Add a test topic with status "queued" first)
claude -p "Run /pipeline-run"
```

---

## Running Manually from MacBook Pro

You can run the pipeline manually from your MacBook Pro at any time.

### One-Time Setup on MacBook Pro

1. Clone the same repo (if not already done):
   ```bash
   cd ~/Projects/code
   git clone https://github.com/altitudeinfosys/tarek-alaaddin.git
   ```

2. Install Claude Code CLI:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

3. Install GitHub CLI:
   ```bash
   brew install gh
   gh auth login
   ```

4. Set your Anthropic API key in `~/.zshrc`:
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-your-key-here"
   ```

5. Open Chrome and log into X and LinkedIn
6. Install the Claude in Chrome extension
7. Set `NOTION_TOKEN` environment variable in `~/.zshrc`

### Running a Manual Pipeline

```bash
cd ~/Projects/code/tarek-alaaddin
git pull  # Get latest changes

# Option A: Non-interactive (runs fully automated)
claude -p "Run /pipeline-run"

# Option B: Interactive (you can watch and intervene)
claude
# Then type: /pipeline-run

# Option C: Dry run (test without posting)
claude -p "Run /pipeline-run dry-run"
```

**Note**: If runs from multiple machines overlap, each will pick a different queued topic from Notion (the status field prevents double-processing).

---

## File Reference

### Repo Files

```
tarek-alaaddin/
├── .claude/skills/
│   ├── pipeline-run/SKILL.md     # Master orchestrator (7 phases)
│   ├── post-to-x/SKILL.md       # X posting via browser automation
│   └── post-to-linkedin/SKILL.md # LinkedIn posting via browser automation
├── logs/pipeline/
│   ├── .gitkeep
│   ├── YYYYMMDD-HHMMSS-run-N.log # Per-run Claude output
│   └── screenshots/
│       ├── .gitkeep
│       └── *.png                 # Pre/post social post screenshots
└── docs/
    ├── content-pipeline-flow.excalidraw  # Architecture diagram
    └── CONTENT-PIPELINE-SETUP.md         # This document
```

---

## Costs

| Component | Cost |
|-----------|------|
| X/Twitter posting | $0 (browser automation) |
| LinkedIn posting | $0 (browser automation) |
| Notion | $0 (free plan sufficient) |
| Infrastructure | $0 (runs on your Mac) |
| Claude Code CLI | Usage-based (Anthropic API) |
| **Total** | **~$0/month** + Claude API usage |

---

## Recent Improvements (v2)

- **Mandatory research phase**: Phase 1.5 visits official documentation for every tool/product mentioned before writing, building a verified facts sheet. Prevents factual errors from relying on stale internal knowledge.
- **Known docs URL table**: Common tools have pre-configured documentation URLs for faster lookup.
- **X hashtags**: X/Twitter posts now include 2-3 relevant, specific hashtags (e.g., #ClaudeCode) to improve discoverability.

## Future Improvements (v3)

- **Full auto mode**: Remove the PR approval gate; add a self-review step instead
- **Blog image generation**: Auto-generate cover images using AI
- **Analytics tracking**: Add columns for post engagement metrics
- **Multi-platform**: Add Instagram, Threads, Bluesky
- **Content calendar**: Schedule topics for specific dates
- **A/B testing**: Generate multiple social copy variants and pick the best performer
