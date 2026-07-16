# Portfolio — Aman Mehtar

A personal portfolio inspired by [dhravya.dev](https://dhravya.dev/), built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## Features

- Clean paper aesthetic with Hanken Grotesk, blue accent, and subtle grain
- Sticky sidebar nav (bottom bar on mobile): Home · Writing · Stuff · Guestbook
- Gradient headline, dotted bio links, animated underlines
- Custom cursor on fine-pointer devices
- Writing list + individual post pages
- Projects (“Stuff”) page
- Guestbook (localStorage demo)
- GitHub contribution graph
- Single config file for all content

## Getting started

```bash
cd portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customize

Edit **`src/lib/site.ts`** — name, bio, socials, story bullets, writing, and projects all live there.

| Field | What it controls |
|--------|------------------|
| `name`, `title`, `description` | Site identity & SEO |
| `headline` | Gradient hero line |
| `bio` | Intro paragraph |
| `socials`, `email` | Social icons & mailto |
| `githubUsername` | Contribution graph |
| `story` | Bullet list on the home page |
| `writing` | Posts (home preview + `/writing`) |
| `projects` | Stuff list |

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

## Deploy

Push to GitHub and deploy on [Vercel](https://vercel.com) (zero config for Next.js).
