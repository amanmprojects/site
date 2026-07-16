# Portfolio — Aman Mehtar

A personal portfolio inspired by [dhravya.dev](https://dhravya.dev/), built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## Features

- Clean paper aesthetic with Hanken Grotesk, blue accent, and subtle grain
- Sticky sidebar nav (bottom bar on mobile): Home · Writing · Stuff · Guestbook
- Gradient headline, dotted bio links, animated underlines
- Custom cursor on fine-pointer devices
- Writing from Markdown files (`content/writing/`)
- Projects (“Stuff”) page
- Guestbook (localStorage demo)
- GitHub contribution graph
- Single config file for site identity + projects

## Getting started

```bash
cd portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customize

### Site identity & projects

Edit **`src/lib/site.ts`** — name, bio, socials, story bullets, and projects live there.

| Field | What it controls |
|--------|------------------|
| `name`, `title`, `description` | Site identity & SEO |
| `headline` | Gradient hero line |
| `bio` | Intro paragraph |
| `socials`, `email` | Social icons & mailto |
| `githubUsername` | Contribution graph |
| `story` | Bullet list on the home page |
| `projects` | Stuff list |

### Writing posts

Posts are Markdown files in **`content/writing/`**.

1. Copy `_template.md` (or create a new `.md` file).
2. Name it with the URL slug you want, e.g. `my-first-post.md` → `/writing/my-first-post`.
3. Fill in frontmatter and write the body in Markdown.

```md
---
title: "My first post"
date: "2026-07-16"
excerpt: "One-line teaser for the list and home page."
# draft: true
---

Your post body in **Markdown**.
```

| Frontmatter | Required | Notes |
|-------------|----------|--------|
| `title` | yes | Post title |
| `date` | yes | ISO date (`YYYY-MM-DD`) for sorting |
| `excerpt` | no | List teaser; falls back to the first ~160 chars |
| `draft` | no | If `true`, hidden in production (still shown in dev) |

- Files starting with `_` (like `_template.md`) are ignored.
- Posts are sorted newest-first automatically.
- Loader lives in `src/lib/posts.ts`.

Update links in `src/components/SocialLinks.tsx` only if you add new platforms.

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- gray-matter + marked (writing)

## Deploy

Push to GitHub and deploy on [Vercel](https://vercel.com) (zero config for Next.js).
