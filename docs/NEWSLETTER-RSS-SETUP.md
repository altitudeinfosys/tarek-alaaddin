# Newsletter Auto-Broadcast via RSS

New blog posts are delivered to Kit (ConvertKit) newsletter subscribers automatically through an RSS feed + Kit's native RSS-to-broadcast automation. No custom code runs on publish — Kit polls the feed and sends a broadcast when it detects a new item.

## How it works

1. Every published MDX file in `content/blog/` is exposed in a public RSS feed at `https://www.tarekalaaddin.com/feed.xml`.
2. Kit polls that feed (roughly hourly) and, when a new item appears, triggers a broadcast to the configured audience.
3. To publish a post without emailing it, set `published: false` in the frontmatter, or delay merging.

## Files involved

- [app/feed.xml/route.ts](../app/feed.xml/route.ts) — generates the RSS 2.0 feed from `getAllPosts()` in `lib/mdx.ts`. Filters `published: true`, sorts by date desc.
- [app/layout.tsx](../app/layout.tsx) — adds `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` to the site head so feed readers and Kit can auto-discover the feed.
- [components/blog/BlogClientWrapper.tsx](../components/blog/BlogClientWrapper.tsx) — renders a visible "RSS" link on the blog index.

## One-time Kit dashboard setup

These steps are done once in the Kit web UI. They cannot be scripted — Kit's RSS automation is configured per-account.

1. Log in to Kit → **Send → Sequences** (or **Automations → RSS Feed**, depending on the current Kit UI).
2. Create a new RSS-triggered broadcast/sequence. Feed URL: `https://www.tarekalaaddin.com/feed.xml`.
3. **Schedule:** "Send immediately when a new post is detected" (or a daily digest — pick what fits your cadence).
4. **Audience:** all active subscribers to start. Later, you can target by `interest-productivity`, `interest-ai`, or `interest-marketing` tags defined in [`lib/kit.ts`](../lib/kit.ts) using Kit's segmentation.
5. **Email template:** use the standard Kit RSS merge tags — typically `{{ post.title }}`, `{{ post.description }}`, `{{ post.url }}`. Only the post title, excerpt, and a "Read on the site" link are included in the feed (no full post body).
6. **Before enabling:** send a test to yourself. Confirm title, excerpt, and link render correctly.
7. **⚠️ Check "send only future items"** before turning the automation on. Kit may otherwise treat all 45+ existing posts as new and blast the entire archive in one burst. This is the highest-risk step.

## Verifying

After deploying:

```bash
# Feed is served
curl -sSI https://www.tarekalaaddin.com/feed.xml

# Feed has items
curl -sS https://www.tarekalaaddin.com/feed.xml | grep -c '<item>'

# Validate against the W3C feed validator
open 'https://validator.w3.org/feed/check.cgi?url=https%3A%2F%2Fwww.tarekalaaddin.com%2Ffeed.xml'
```

## Why RSS instead of a GitHub Action?

- Zero code to maintain on publish — no API keys in CI.
- Zero state to track — Kit de-duplicates based on item `<guid>`.
- Gives the site a real RSS feed for feed-reader audiences regardless of email use.
- Easy to pause: disable the Kit automation, no deploy needed.
