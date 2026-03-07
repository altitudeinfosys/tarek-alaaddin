# Social Media Copy Formats

## X/Twitter Copy (280 chars max)

### Format
```
[Hook — surprising stat, bold claim, or provocative question]

[1-2 sentence summary of the key insight]

[Blog URL]
```

### Rules
- Max 280 characters total (including URL)
- Include 2-3 relevant hashtags at the end
- Hashtags count toward the 280 character limit
- Choose specific, discoverable hashtags (e.g., #ClaudeCode not #AI)
- Make the hook compelling enough to stop scrolling
- URL counts as ~23 characters (t.co shortening)

## LinkedIn Copy (150-300 words)

### Format
```
[Hook line — this shows before "...see more", make it irresistible]

[Paragraph 2 — the problem or context]

[Paragraph 3 — the insight or solution]

[Paragraph 4 — personal experience or data point]

[CTA — question to drive engagement]

Read the full post: [Blog URL]

#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
```

### Rules
- First line is CRITICAL — it's what shows before the fold
- Use line breaks between every paragraph (LinkedIn formatting)
- 3-5 relevant hashtags at the end
- End with a question to drive comments
- Mention "link in comments" if you want to maximize reach (LinkedIn deprioritizes posts with links)

## Saving Social Copy to Notion

After generating both copies, update Notion:
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/PAGE_ID" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{
    "properties": {
      "Status": {"select": {"name": "generated"}},
      "X Text": {"rich_text": [{"text": {"content": "TWEET_TEXT"}}]},
      "LinkedIn Text": {"rich_text": [{"text": {"content": "LINKEDIN_TEXT"}}]},
      "Blog URL": {"url": "https://tarekalaaddin.com/blog/SLUG"}
    }
  }'
```

> **Note**: Notion rich_text supports up to 2000 characters per text block. LinkedIn posts fit within this limit.
