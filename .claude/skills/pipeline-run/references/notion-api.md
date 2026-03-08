# Notion API Reference

## Database Configuration

**Database ID**: `319610c68f04811ea752e9d0cee2f0d1`

**Parent page**: TarekAlaaddinContent (`319610c68f048047a1a1ddd9c7705ddd`)

**Database properties**:

| Property | Type | Purpose |
|----------|------|---------|
| Topic | title | The content idea to process |
| Status | select | Pipeline phase tracking |
| Date Queued | date | When the topic was added |
| Blog Slug | rich_text | Auto-filled by pipeline |
| Blog URL | url | Auto-filled by pipeline |
| X Text | rich_text | Auto-generated tweet text |
| LinkedIn Text | rich_text | Auto-generated LinkedIn text |
| Notes | rich_text | Status updates and error messages |

**Page body**: Each topic entry can contain rich context in the note body — paragraphs, links, bullet points, images. This context is read during Phase 1 and passed to the blog generation phase for richer, more informed content.

**Status values flow**: `queued` → `researching` → `generating` → `critiquing` → `generated` → `posted-x` → `posted-linkedin` → `done`

On failure at any stage: status becomes `failed` and the error is written to the Notes property.

## API Patterns

All queue operations use the Notion REST API via curl. The `NOTION_TOKEN` is available as an environment variable.

**Query for next queued topic:**
```bash
curl -s 'https://api.notion.com/v1/databases/319610c68f04811ea752e9d0cee2f0d1/query' \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {"property": "Status", "select": {"equals": "queued"}},
    "sorts": [{"property": "Date Queued", "direction": "ascending"}],
    "page_size": 1
  }'
```

**Update page status:**
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/PAGE_ID" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{"properties": {"Status": {"select": {"name": "NEW_STATUS"}}}}'
```

**Update multiple properties:**
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/PAGE_ID" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{
    "properties": {
      "Status": {"select": {"name": "NEW_STATUS"}},
      "Blog Slug": {"rich_text": [{"text": {"content": "SLUG_VALUE"}}]},
      "Notes": {"rich_text": [{"text": {"content": "NOTE_TEXT"}}]}
    }
  }'
```

**Read page body (rich context):**
```bash
curl -s "https://api.notion.com/v1/blocks/PAGE_ID/children" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28'
```

> **Note**: If Notion MCP tools are available (`mcp__notion__*`), prefer using them directly (e.g., `mcp__notion__update-a-page`, `mcp__notion__query-data-source`). Fall back to curl commands if MCP tools are not available in the current session.

## Adding Topics to the Queue

1. Open the Content Pipeline database in Notion
2. Click "New" to add a row
3. Set the **Topic** (title) — e.g., "How to Build AI Agents with Claude Code"
4. Set **Status** to `queued`
5. Set **Date Queued** to today
6. **Optional**: Open the page and add rich context in the body — links, references, bullet points with specific angles to cover, competitor analysis, etc.
