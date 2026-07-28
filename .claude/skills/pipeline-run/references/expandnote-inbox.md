# ExpandNote Inbox Reference

ExpandNote is the **capture inbox** for content ideas. Notion remains the **queue and state
store** — every idea still becomes a Notion row and the pipeline still tracks status there.
ExpandNote just replaces manual typing of long ideas into Notion.

## MCP Server

Tools are exposed by the ExpandNote MCP server with the prefix
`mcp__f8fdc667-0703-4921-8f03-a883d97ac3bb__`. The ones this pipeline uses:

| Tool | Purpose |
|------|---------|
| `list_tags` | Resolve tag names → tag UUIDs (do this every run; do not trust cached IDs blindly) |
| `search_notes` | Find notes carrying the `tarekalaaddin` tag |
| `get_note` | Fetch a note's full content (search results may be truncated) |
| `set_note_tags` | Swap the tag set — this is how a note is marked done |

> These are deferred tools. Load them first with a single `ToolSearch` call:
> `select:mcp__f8fdc667-0703-4921-8f03-a883d97ac3bb__list_tags,mcp__f8fdc667-0703-4921-8f03-a883d97ac3bb__search_notes,mcp__f8fdc667-0703-4921-8f03-a883d97ac3bb__get_note,mcp__f8fdc667-0703-4921-8f03-a883d97ac3bb__set_note_tags`

## Tags

| Tag | UUID (expected) | Meaning |
|-----|-----------------|---------|
| `tarekalaaddin` | `1b8c3bd9-b116-4071-81e8-5af6f9d09a2b` | "This note is a content idea for tarekalaaddin.com" — the pipeline picks it up |
| `done` | `f2582e24-af4a-4d63-a3ec-f753de1df9d8` | Already imported into the Notion queue — never picked up again |

**Always resolve tag IDs by name via `list_tags` at run time.** The UUIDs above are for
verification only. If either tag is missing, create it with `create_tag` and continue.

## How to add an idea

In ExpandNote, write a note — title = the topic, body = as much context as you want (angles to
cover, links, competitor notes, personal anecdotes, specific numbers) — and tag it
`tarekalaaddin`. That's it. The next pipeline run imports it.

The body is the highest-leverage part: it becomes the Notion page body, which Phase 1.5 and
Phase 2 read as **topic_context**. Personal anecdotes and real numbers can only appear in the
blog post if you put them here (see the personal-claim guard in Phase 1.5).

## Query pattern

```
search_notes(tag_ids=["<tarekalaaddin uuid>"], view="active", limit=100)
```

`search_notes` requires a note to carry **all** supplied tag_ids, so pass only the
`tarekalaaddin` id. Sort the results oldest-first by `updated_at` before importing, so the queue
order matches capture order.

## Import mapping: ExpandNote note → Notion row

| ExpandNote | Notion |
|------------|--------|
| `title` | `Topic` (title) |
| `content` | Page body — one paragraph block per line/paragraph |
| `id` | `Source ID` (rich_text), written as `expandnote:<uuid>` |
| — | `Status` = `queued` |
| — | `Date Queued` = today (ISO `YYYY-MM-DD`) |

**Title fallback**: if `title` is `null`, empty, or `"Untitled"`, derive the topic from the first
non-empty line of `content` (trim to ~100 chars, strip leading markdown `#`/`*`/`-`). Never
create a Notion row titled "Untitled".

**Body chunking**: Notion rich_text blocks cap at 2000 characters. Split long paragraphs into
2000-char chunks rather than truncating — long ideas are the whole point of this change.

## Idempotency: the `Source ID` property

`Notes` cannot hold the dedup key — the pipeline overwrites it with critique results and error
messages. So the Notion database has a dedicated `Source ID` rich_text property.

Before importing any note, query Notion for an existing row with that Source ID:

```bash
curl -s 'https://api.notion.com/v1/databases/319610c68f04811ea752e9d0cee2f0d1/query' \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{"filter": {"property": "Source ID", "rich_text": {"equals": "expandnote:NOTE_UUID"}}, "page_size": 1}'
```

If a row comes back, **skip the import** (it was already imported on an earlier run where the
tag swap failed) and go straight to re-attempting the tag swap. This makes the whole import
step safe to re-run.

## Create a Notion row from a note

```bash
curl -s -X POST 'https://api.notion.com/v1/pages' \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{
    "parent": {"database_id": "319610c68f04811ea752e9d0cee2f0d1"},
    "properties": {
      "Topic":     {"title": [{"text": {"content": "TOPIC"}}]},
      "Status":    {"select": {"name": "queued"}},
      "Date Queued": {"date": {"start": "YYYY-MM-DD"}},
      "Source ID": {"rich_text": [{"text": {"content": "expandnote:NOTE_UUID"}}]}
    },
    "children": [
      {"object": "block", "type": "paragraph",
       "paragraph": {"rich_text": [{"type": "text", "text": {"content": "BODY_CHUNK"}}]}}
    ]
  }'
```

Build the JSON payload with a Python heredoc rather than shell string interpolation — note
bodies contain quotes, newlines, and backticks that will corrupt a hand-built `-d` string.

## Marking a note done

`set_note_tags` **replaces the entire tag set**. To swap `tarekalaaddin` → `done` without
destroying the note's other tags:

1. Take the note's current tag list (from `get_note` — it returns tag names).
2. Resolve those names to UUIDs via `list_tags`.
3. Drop the `tarekalaaddin` UUID, add the `done` UUID, keep everything else.
4. Call `set_note_tags(id, tag_ids=<that set>)`.

**5-tag ceiling**: `set_note_tags` accepts at most 5 tags. If dropping `tarekalaaddin` and adding
`done` would still exceed 5, drop the note's oldest non-`done` tag to make room and log which tag
was dropped.

**Locked notes**: `set_note_tags` fails on a locked note (`is_locked: true`). Skip locked notes
entirely at query time — do not import them — and log
`SKIPPED locked note <id> — unlock in ExpandNote to queue it`. Importing one would create a
Notion row that gets re-created on every future run, because the note can never be marked done.

## Failure handling

| Situation | Action |
|-----------|--------|
| ExpandNote MCP unavailable / tools fail to load | Log it, skip the import step, fall back to the existing Notion `queued` backlog |
| No notes carry the `tarekalaaddin` tag | Normal — log "ExpandNote inbox empty", fall back to the Notion queue |
| Note is locked | Skip it, log, continue with the other notes |
| Notion row creation fails for one note | Log, leave the tag alone so it retries next run, continue with the other notes |
| Tag swap fails after the row was created | Log loudly. The `Source ID` guard prevents a duplicate row next run; the swap is retried then |
