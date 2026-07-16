---
title: "Hello, world"
date: "2026-07-16"
excerpt: "First post — how writing works on this site."
---

This site reads posts from a folder. Drop a Markdown file in `content/writing/`, fill in the frontmatter, and it shows up on the home page and `/writing`.

## The recipe

Every post is a single `.md` file:

```md
---
title: "Your title"
date: "2026-07-16"
excerpt: "Short teaser for lists."
---

Body goes here in Markdown.
```

The **filename** is the URL slug. So `hello-world.md` becomes `/writing/hello-world`.

## Tips

- Use ISO dates (`YYYY-MM-DD`) so posts sort correctly.
- Set `draft: true` while you're still writing — drafts stay out of production builds.
- Files that start with `_` (like `_template.md`) are skipped entirely.

That's it. Edit this post, delete it, or add another file next to it.
