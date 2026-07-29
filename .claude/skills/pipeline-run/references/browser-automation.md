# Browser Automation Reference

Browser automation is used for posting to X and LinkedIn. Queue management and status tracking use the Notion API directly — no browser required.

## Detection Logic

1. Try Chrome Extension first: call `mcp__claude-in-chrome__tabs_context_mcp`
2. If it responds successfully → use **Chrome Extension** backend
3. If it fails or is unavailable → use **Playwright** backend (call `mcp__plugin_playwright_playwright__browser_navigate` to verify it works)
4. Log which backend is active before proceeding

## A login wall does NOT mean the session expired

**Tarek has more than one Chrome connected, and the X and LinkedIn sessions live in different
ones.** Observed 2026-07-28: X was signed in on one browser, LinkedIn on the other. Hitting
LinkedIn on the X browser produced a normal-looking sign-in page — indistinguishable from an
expired session, and Playwright showed the same wall because it is a third browser again.

So when a platform shows a login page, **do not conclude the session expired and do not skip the
phase**. First call `mcp__claude-in-chrome__list_connected_browsers`. If more than one browser is
connected, the session is probably in another one — switch with
`mcp__claude-in-chrome__select_browser` using its `deviceId`, then re-open the platform and check
again. Only after every connected browser shows a login wall is the session genuinely expired.

Browsers seen on this machine (deviceIds are stable per install but will change if the extension
is reinstalled — always re-list rather than trusting these):

| Browser | deviceId | Session observed |
|---------|----------|------------------|
| Browser 1 | `12e2bdd2-1be1-420b-bf0b-ac33d2b3b1e4` | X / x.com signed in |
| Browser 2 | `fc7fc94b-c668-4e81-8141-0065da928365` | LinkedIn signed in |

After `select_browser`, the previous tab IDs are invalid — call `tabs_context_mcp` again to get
tab IDs for the newly selected browser before any further action.

**Never enter credentials.** If a login wall genuinely survives every browser, never type a
username, password, or 2FA code, and never solve a CAPTCHA. Skip the phase, record
`LOGIN EXPIRED: <platform>` in Notion Notes, and let Phase 7 mark the row `posted-partial`.
Only Tarek can restore a session.

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
