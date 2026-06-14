# Homepage Redesign — Mockups

Three design directions for the **tarekalaaddin.com homepage**. These are throwaway static HTML
previews (Tailwind via CDN) — **they do not touch the live Next.js app**. Pick a direction and I'll
implement it into the real components.

## How to view

```bash
open mockups/index.html
```

`index.html` is a menu linking to all three. Or open any one directly:

- `bold-modern.html` — **Bold & Modern**: split hero (photo + big type), high-contrast, confident. Light theme.
- `vibrant-playful.html` — **Vibrant & Playful**: glassmorphism, gradients, floating accents, soft serif headings. Most "pop."
- `sleek-techy.html` — **Sleek & Techy**: dark-first, neon-cyan accents, terminal/dev touches. Strong AI-engineer signal.

Scroll each one top to bottom — they're full homepages (hero → highlights → writing → products → about → newsletter → footer). Resize the browser narrow to preview mobile.

## What's shared across all three

- Your real photo (`assets/tarek.jpg`, framed to keep the focus on your face)
- The existing **sky-blue** brand color (`#0284c7`)
- A **balanced** layout: who you are + your writing + your products
- Real content: 20+ years, Java/Spring/React/cloud, Taskitos, ExpandNote, your socials
- Blog titles/counts are **placeholders** — the real build pulls live posts from the site

## Swapping the photo

Replace `assets/tarek.jpg` with any image of the same name to update all three previews at once.

## Next step

Tell me which direction (or a mix — e.g. "hero from Bold, products from Techy"). Then I implement it
into `components/home/LandingHero.tsx` + friends on a feature branch, with dark-mode parity, and ask
before merging to main.
