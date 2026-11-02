import { expect, test } from "@playwright/test";
import { postSlugs } from "./helpers";

const SITE = "https://aman-on-bits.vercel.app";

test("the RSS feed lists every post", async ({ request }) => {
  const response = await request.get("/feed.xml");
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await response.text();
  expect(xml).toContain(`<atom:link href="${SITE}/feed.xml" rel="self"`);
  for (const slug of postSlugs) {
    expect(xml).toContain(`<link>${SITE}/writing/${slug}</link>`);
  }
});

test("the sitemap lists every page and post", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const path of ["", "/writing", "/stuff", ...postSlugs.map((s) => `/writing/${s}`)]) {
    expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
  }
});

test("robots.txt points at the sitemap", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain(
    `Sitemap: ${SITE}/sitemap.xml`,
  );
});

test("the site-wide share image renders", async ({ request }) => {
  const response = await request.get("/opengraph-image");
  expect(response.headers()["content-type"]).toBe("image/png");
});
