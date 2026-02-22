---
name: post-to-linkedin
description: Post content to LinkedIn using Chrome browser automation. Provide the post text and this skill handles navigation, composing, posting, and verification via screenshots.
user-invocable: true
arguments: "LinkedIn post text (150-300 words recommended)"
---

# Post to LinkedIn

Posts content to LinkedIn using Chrome browser automation (`mcp__claude-in-chrome` tools). No API key needed — uses the logged-in browser session. Bypasses LinkedIn's API posting restrictions.

## Usage

- `/post-to-linkedin <post text>` — Post specific content
- `/post-to-linkedin` — Interactive mode, will ask for post text

## Prerequisites

- Chrome must be running with the Claude in Chrome extension active
- User must be logged into LinkedIn (linkedin.com) in Chrome
- The `mcp__claude-in-chrome` MCP tools must be available

## Process

### Step 1: Validate Post Text

- If no text provided, ask the user for the post content
- LinkedIn posts can be up to 3,000 characters
- Recommended length: 150-300 words for engagement
- Store the final post text

### Step 2: Pre-Flight Check

1. Get browser tab context: `mcp__claude-in-chrome__tabs_context_mcp`
2. Create a new tab: `mcp__claude-in-chrome__tabs_create_mcp`
3. Navigate to `https://www.linkedin.com/feed/` using `mcp__claude-in-chrome__navigate`
4. Wait 3 seconds for page load: `mcp__claude-in-chrome__computer` with action `wait`
5. Take a screenshot to verify login state: `mcp__claude-in-chrome__computer` with action `screenshot`
6. **If not logged in** (login/signup page visible): STOP and tell the user "You're not logged into LinkedIn. Please log in manually and try again."

### Step 3: Open Post Composer

1. Use `mcp__claude-in-chrome__find` to locate the "Start a post" button or the compose area (query: "Start a post")
2. Click on it using `mcp__claude-in-chrome__computer` with action `left_click`
3. Wait 2 seconds for the post modal to open
4. Take a screenshot to verify the modal is open

### Step 4: Type Post Content

1. Use `mcp__claude-in-chrome__find` to locate the text editor inside the modal (query: "post text editor" or "What do you want to talk about")
2. Click on the text editor using `mcp__claude-in-chrome__computer` with action `left_click`
3. Type the post content using `mcp__claude-in-chrome__computer` with action `type`
   - For long posts, type in chunks if needed
   - Newlines in the text will create paragraph breaks
4. Wait 1 second for text to render

### Step 5: Verify Before Posting

1. Take a screenshot: `mcp__claude-in-chrome__computer` with action `screenshot`
2. Verify the post text appears correctly in the composer
3. **If running in pipeline mode** (called from `/pipeline-run`): proceed to posting automatically
4. **If running manually**: Show the screenshot to the user and ask: "LinkedIn post is ready. Should I post it?"
5. Wait for user confirmation before proceeding (manual mode only)

### Step 6: Post to LinkedIn

1. Use `mcp__claude-in-chrome__find` to locate the Post button in the modal (query: "Post button")
2. Click the Post button using `mcp__claude-in-chrome__computer` with action `left_click`
3. Wait 3 seconds for the post to submit

### Step 7: Verify Post Success

1. Take a screenshot: `mcp__claude-in-chrome__computer` with action `screenshot`
2. Check for success indicators:
   - The compose modal dismissed
   - No error messages visible
   - A success toast/notification may appear
   - Feed view returns with the new post visible
3. If posting from pipeline, save the screenshot to `logs/pipeline/screenshots/` with timestamp filename
4. Report success or failure to the caller

### Step 8: Cleanup

1. Close the tab or navigate away

## Error Handling

| Error | Action |
|-------|--------|
| Not logged in | STOP. Tell user to log in manually. |
| "Start a post" not found | Try scrolling up. Try `mcp__claude-in-chrome__find` with alternative queries like "create a post" or "share". If still not found, STOP and report. |
| Post modal didn't open | Take screenshot, try clicking again. If still fails, STOP and report. |
| Text editor not found in modal | Take screenshot, try `mcp__claude-in-chrome__read_page` to inspect modal structure. STOP and report if not found. |
| Post button not found | Take screenshot, STOP and report error with screenshot. |
| Post failed (error visible) | Take screenshot, report the error message. |

## LinkedIn Post Best Practices

When generating content for LinkedIn (used by `/pipeline-run`):

1. **Hook** (first line): Bold statement, question, or surprising stat — this is what shows before "...see more"
2. **Body** (3-4 short paragraphs): One idea per paragraph, use line breaks between paragraphs
3. **CTA**: End with a question or call-to-action to drive engagement
4. **Hashtags**: 3-5 relevant hashtags at the end
5. **Formatting**: Use line breaks liberally. LinkedIn rewards readable, scannable posts.
6. **No links in body**: LinkedIn deprioritizes posts with links. Put the blog link in the first comment instead, or mention "link in comments."

## Safety

- **Manual mode**: Always confirm with user before clicking Post
- **Pipeline mode**: Posts automatically (user pre-approved via pipeline)
- Never post duplicate content — caller is responsible for dedup
- Screenshots are taken before and after posting for audit trail

## Output

Returns a status object to the caller:
- `success`: boolean
- `post_text`: the posted text
- `screenshot_path`: path to verification screenshot (if saved)
- `error`: error message (if failed)
