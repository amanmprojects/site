import { afterEach, describe, expect, it } from "vitest";
import {
  getAdjacentPosts,
  getAllPosts,
  groupPostsByYear,
  makeFallbackExcerpt,
  readingMinutes,
  renderMarkdown,
  slugifyHeading,
  type PostMeta,
} from "@/lib/posts";

function meta(slug: string, dateISO: string): PostMeta {
  return {
    slug,
    title: slug,
    date: "",
    dateISO,
    excerpt: "",
    href: `/writing/${slug}`,
    readingMinutes: 1,
  };
}

describe("slugifyHeading", () => {
  it.each([
    ["The two designs", "the-two-designs"],
    ["Act 5: Bridging the Unbridgeable (`wl wet 1`)", "act-5-bridging-the-unbridgeable-wl-wet-1"],
    ["Error `-7` Wasn't What It Looked Like", "error-7-wasnt-what-it-looked-like"],
    ["Model — briefly", "model-briefly"],
    ["[Linked](https://example.com) heading", "linked-heading"],
    ["  -edge- ", "edge"],
  ])("%s → %s", (input, expected) => {
    expect(slugifyHeading(input)).toBe(expected);
  });
});

describe("renderMarkdown headings", () => {
  it("gives headings ids and a self link", () => {
    const html = renderMarkdown("## Hello world");
    expect(html.trim()).toBe(
      '<h2 id="hello-world"><a class="anchor" href="#hello-world">Hello world</a></h2>',
    );
  });

  it("keeps inline formatting inside the anchor", () => {
    expect(renderMarkdown("### Use `wl wet 1`")).toContain(
      '<a class="anchor" href="#use-wl-wet-1">Use <code>wl wet 1</code></a>',
    );
  });

  it("numbers repeated headings so every id is unique", () => {
    const html = renderMarkdown("## Results\n\n## Results\n\n## Results");
    expect([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1])).toEqual([
      "results",
      "results-1",
      "results-2",
    ]);
  });

  it("starts numbering fresh for each document", () => {
    renderMarkdown("## Results");
    expect(renderMarkdown("## Results")).toContain('id="results"');
  });

  it("does not nest a link inside a link", () => {
    const html = renderMarkdown("## See [docs](https://example.com)");
    expect(html).toContain('id="see-docs"');
    expect(html).not.toContain("anchor");
  });

  it("falls back to a placeholder id for symbol-only headings", () => {
    expect(renderMarkdown("## ???")).toContain('id="section"');
  });

  it("drops author-supplied classes and handlers but keeps safe ids", () => {
    const html = renderMarkdown(
      '<h2 id="ok" onclick="alert(1)" class="x">Raw</h2>\n\n<a class="evil" href="https://example.com">x</a>',
    );
    expect(html).toContain('<h2 id="ok">');
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("evil");
    expect(html).not.toContain('class="x"');
  });
});

describe("makeFallbackExcerpt", () => {
  it("keeps link text and drops the URL", () => {
    expect(makeFallbackExcerpt("Read [the docs](https://example.com/x) now.")).toBe(
      "Read the docs now.",
    );
  });

  it("keeps image alt text and drops the URL", () => {
    expect(makeFallbackExcerpt("![a chart](/c.png) shows it")).toBe(
      "a chart shows it",
    );
  });

  it("skips code blocks and headings", () => {
    expect(makeFallbackExcerpt("## Title\n\n```js\nx()\n```\n\nBody **bold**.")).toBe(
      "Title Body bold.",
    );
  });

  it("cuts long text on a word boundary with an ellipsis", () => {
    const excerpt = makeFallbackExcerpt("word ".repeat(100));
    expect(excerpt.length).toBeLessThanOrEqual(161);
    expect(excerpt.endsWith("word…")).toBe(true);
  });
});

describe("readingMinutes", () => {
  it("is at least one minute", () => {
    expect(readingMinutes("Short.")).toBe(1);
  });

  it("counts prose at about 230 words a minute and ignores code", () => {
    const prose = "word ".repeat(2300);
    const code = "```\n" + "token ".repeat(5000) + "\n```";
    expect(readingMinutes(prose)).toBe(10);
    expect(readingMinutes(`${prose}\n\n${code}`)).toBe(10);
  });
});

describe("groupPostsByYear", () => {
  const originalTz = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it("files a Jan 1 post under its own year west of UTC", () => {
    process.env.TZ = "America/Los_Angeles";
    const groups = groupPostsByYear([
      meta("new-year", "2026-01-01"),
      meta("late", "2025-12-31"),
    ]);
    expect(groups.map(([year, posts]) => [year, posts.map((p) => p.slug)])).toEqual([
      ["2026", ["new-year"]],
      ["2025", ["late"]],
    ]);
  });
});

describe("getAdjacentPosts", () => {
  const posts = getAllPosts();

  it("links the newest post only to an older one", () => {
    const { newer, older } = getAdjacentPosts(posts[0].slug);
    expect(newer).toBeNull();
    expect(older?.slug).toBe(posts[1].slug);
  });

  it("links the oldest post only to a newer one", () => {
    const last = posts.length - 1;
    const { newer, older } = getAdjacentPosts(posts[last].slug);
    expect(newer?.slug).toBe(posts[last - 1].slug);
    expect(older).toBeNull();
  });

  it("returns nothing for an unknown slug", () => {
    expect(getAdjacentPosts("no-such-post")).toEqual({ newer: null, older: null });
  });
});

describe("renderMarkdown tables", () => {
  const table = "|   | a | b |\n|---|:-:|--:|\n| x | 1 | 2 |";

  it("turns an empty header cell into a data cell", () => {
    const html = renderMarkdown(table);
    expect(html).toContain("<thead>\n<tr>\n<td></td>");
    expect(html).not.toMatch(/<th[^>]*><\/th>/);
  });

  it("keeps column alignment as a text-align style", () => {
    const html = renderMarkdown(table);
    expect(html).toContain('<th style="text-align:center">a</th>');
    expect(html).toContain('<td style="text-align:right">2</td>');
  });

  it("drops any other inline style", () => {
    const html = renderMarkdown(
      '<table><tr><td style="background:url(https://evil.example)">x</td></tr></table>',
    );
    expect(html).not.toContain("evil");
    expect(html).not.toContain("style");
  });
});
