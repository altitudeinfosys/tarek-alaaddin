---
name: post-to-x
description: "Post a tweet to X using browser automation (Chrome Extension or Playwright fallback). Provide the tweet text and this skill handles navigation, typing, posting, and verification via screenshots."
user-invocable: true
arguments: "tweet text to post, 280 chars max"
---

# Post to X (Twitter)

Posts a tweet to X using browser automation. Supports two backends: Chrome Extension (preferred) or Playwright MCP tools (fallback). No API key needed — uses the logged-in browser session.

## Usage

- `/post-to-x This is my tweet text` — Post a specific tweet
- `/post-to-x` — Interactive mode, will ask for tweet text

## Prerequisites

- **Browser**: Chrome with Claude in Chrome extension active (preferred), OR Playwright MCP tools available (fallback)
- User must be logged into X (x.com) in the active browser
- For Playwright: the MCP server must be configured with `--user-data-dir` for login persistence

## Browser Backend

This skill auto-detects the available browser backend. If called from `/pipeline-run`, the backend is already detected — reuse it.

### Detection Logic

1. Try Chrome Extension: call `tabs_context_mcp`
2. If connected → use **Chrome Extension**
3. If not → use **Playwright**

### Tool Mapping Reference

| Action | Chrome Extension | Playwright |
|--------|-----------------|------------|
| Get tab context | `tabs_context_mcp` | `browser_tabs` (action: list) |
| Create new tab | `tabs_create_mcp` | `browser_tabs` (action: new) |
| Navigate to URL | `navigate` | `browser_navigate` |
| Find element | `find` (natural language) | `browser_snapshot` → find ref by role/text |
| Click element | `computer` (left_click) | `browser_click` (ref from snapshot) |
| Type text | `computer` (type) | `browser_type` (ref from snapshot) |
| Take screenshot | `computer` (screenshot) | `browser_take_screenshot` |
| Wait | `computer` (wait) | `browser_wait_for` |

> **Playwright element interaction**: Unlike Chrome Extension's `find()` which accepts natural language queries, Playwright requires taking a `browser_snapshot` first, then using element `ref` IDs from the snapshot to interact. Always snapshot before clicking or typing.

## Process

### Step 1: Validate Tweet Text

- If no text provided, ask the user for the tweet text
- Verify the tweet is 280 characters or fewer
- If over 280 chars, trim or ask user to revise
- Store the final tweet text for posting

### Step 2: Pre-Flight Check

1. Detect browser backend (or reuse if already detected by pipeline)
2. Create a new tab
3. Navigate to `https://x.com/compose/post`
4. Wait 3 seconds for page load
5. Take a screenshot to verify login state
6. **If not logged in** (login page visible): STOP and tell the user "You're not logged into X. Please log in manually and try again."

### Step 3: Compose Tweet

1. Find the compose textbox (query: "tweet compose text area" or "What's happening")
   - **Chrome Extension**: use `find` with natural language query
   - **Playwright**: take a `browser_snapshot`, locate the textbox by its role (`textbox`) or label text, use its ref
2. Click on the textbox
3. Type the tweet text
4. Wait 1 second for text to render

### Step 4: Verify Before Posting

1. Take a screenshot
2. Verify the tweet text appears correctly in the compose box
3. **If running in pipeline mode** (called from `/pipeline-run`): proceed to posting automatically
4. **If running manually**: Show the screenshot to the user and ask: "Tweet is ready. Should I post it?"
5. Wait for user confirmation before proceeding (manual mode only)

### Step 5: Post the Tweet

1. Find the Post button
   - **Chrome Extension**: use `find` with query "Post button"
   - **Playwright**: take a `browser_snapshot`, locate the button by text "Post", use its ref
2. Click the Post button
3. Wait 3 seconds for the post to submit

### Step 6: Verify Post Success

1. Take a screenshot
2. Check for success indicators:
   - The compose modal dismissed
   - No error messages visible
   - Feed or profile view showing the new tweet
3. If posting from pipeline, save the screenshot to `logs/pipeline/screenshots/` with timestamp filename
4. Report success or failure to the caller

### Step 7: Cleanup

1. Close the tab or navigate to `about:blank`

## Error Handling

| Error | Action |
|-------|--------|
| Not logged in | STOP. Tell user to log in manually. |
| Compose box not found | Try refreshing the page. If still not found, STOP and report error. |
| Post button not found | Take screenshot, STOP and report error with screenshot. |
| Post failed (error message visible) | Take screenshot, report the error message. |
| Character limit exceeded | Trim text or ask user to revise. |

## Safety

- **Manual mode**: Always confirm with user before clicking Post
- **Pipeline mode**: Posts automatically (user pre-approved via pipeline)
- Never post duplicate content — caller is responsible for dedup
- Screenshots are taken before and after posting for audit trail

## Output

Returns a status object to the caller:
- `success`: boolean
- `tweet_text`: the posted text
- `screenshot_path`: path to verification screenshot (if saved)
- `error`: error message (if failed)
