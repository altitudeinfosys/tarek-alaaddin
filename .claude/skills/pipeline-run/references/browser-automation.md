# Browser Automation Reference

Browser automation is used for posting to X and LinkedIn. Queue management and status tracking use the Notion API directly — no browser required.

## Detection Logic

1. Try Chrome Extension first: call `mcp__claude-in-chrome__tabs_context_mcp`
2. If it responds successfully → use **Chrome Extension** backend
3. If it fails or is unavailable → use **Playwright** backend (call `mcp__plugin_playwright_playwright__browser_navigate` to verify it works)
4. Log which backend is active before proceeding

## Tool Mapping Reference

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

## Playwright Prerequisites

- Playwright MCP server must be configured with `--user-data-dir` for login persistence
- **First-time setup**: Run the pipeline once, then log into X and LinkedIn manually in the Playwright browser window. Subsequent runs reuse the saved session.
- If sessions expire, log in again manually in the Playwright browser
