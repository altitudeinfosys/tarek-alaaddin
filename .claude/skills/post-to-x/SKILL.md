---
name: post-to-x
description: "Post a tweet to X using Chrome browser automation. Provide the tweet text and this skill handles navigation, typing, posting, and verification via screenshots."
user-invocable: true
arguments: "tweet text to post, 280 chars max"
---

# Post to X (Twitter)

Posts a tweet to X using Chrome browser automation (`mcp__claude-in-chrome` tools). No API key needed — uses the logged-in browser session.

## Usage

- `/post-to-x This is my tweet text` — Post a specific tweet
- `/post-to-x` — Interactive mode, will ask for tweet text

## Prerequisites

- Chrome must be running with the Claude in Chrome extension active
- User must be logged into X (x.com) in Chrome
- The `mcp__claude-in-chrome` MCP tools must be available

## Process

### Step 1: Validate Tweet Text

- If no text provided, ask the user for the tweet text
- Verify the tweet is 280 characters or fewer
- If over 280 chars, trim or ask user to revise
- Store the final tweet text for posting

### Step 2: Pre-Flight Check

1. Get browser tab context: `mcp__claude-in-chrome__tabs_context_mcp`
2. Create a new tab: `mcp__claude-in-chrome__tabs_create_mcp`
3. Navigate to `https://x.com/compose/post` using `mcp__claude-in-chrome__navigate`
4. Wait 3 seconds for page load: `mcp__claude-in-chrome__computer` with action `wait`
5. Take a screenshot to verify login state: `mcp__claude-in-chrome__computer` with action `screenshot`
6. **If not logged in** (login page visible): STOP and tell the user "You're not logged into X. Please log in manually and try again."

### Step 3: Compose Tweet

1. Use `mcp__claude-in-chrome__find` to locate the compose textbox (query: "tweet compose text area" or "What's happening")
2. Click on the textbox using `mcp__claude-in-chrome__computer` with action `left_click`
3. Type the tweet text using `mcp__claude-in-chrome__computer` with action `type`
4. Wait 1 second for text to render

### Step 4: Verify Before Posting

1. Take a screenshot: `mcp__claude-in-chrome__computer` with action `screenshot`
2. Verify the tweet text appears correctly in the compose box
3. **If running in pipeline mode** (called from `/pipeline-run`): proceed to posting automatically
4. **If running manually**: Show the screenshot to the user and ask: "Tweet is ready. Should I post it?"
5. Wait for user confirmation before proceeding (manual mode only)

### Step 5: Post the Tweet

1. Use `mcp__claude-in-chrome__find` to locate the Post button (query: "Post button")
2. Click the Post button using `mcp__claude-in-chrome__computer` with action `left_click`
3. Wait 3 seconds for the post to submit

### Step 6: Verify Post Success

1. Take a screenshot: `mcp__claude-in-chrome__computer` with action `screenshot`
2. Check for success indicators:
   - The compose modal dismissed
   - No error messages visible
   - Feed or profile view showing the new tweet
3. If posting from pipeline, save the screenshot to `logs/pipeline/screenshots/` with timestamp filename
4. Report success or failure to the caller

### Step 7: Cleanup

1. Close the tab: use `mcp__claude-in-chrome__navigate` to go to `about:blank` or close the tab

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
