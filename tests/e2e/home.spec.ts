import { expect, test } from "@playwright/test";

test("every story link renders, whatever its casing", async ({ page }) => {
  await page.goto("/");
  const story = page.locator("main ul").first();
  for (const [name, href] of [
    ["Minihub", "https://github.com/amanmprojects/minihub"],
    ["DSA", "https://github.com/amanmprojects/dsa"],
    ["94M chess model", "https://github.com/amanmprojects/llm"],
  ]) {
    await expect(story.getByRole("link", { name, exact: true })).toHaveAttribute(
      "href",
      href,
    );
  }
});

test("the headline reads as one sentence", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "I love AI & systems and shipping tools.",
  );
});

test("the contribution graph fits on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const fit = await page.locator('img[alt$="contribution graph"]').evaluate((img) => {
    const box = img.parentElement!;
    return { scrolls: box.scrollWidth > box.clientWidth, img: img.clientWidth };
  });
  expect(fit.scrolls).toBe(false);
  expect(fit.img).toBeGreaterThan(400);
});

test("the contribution graph opens on the latest weeks on a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  const edges = await page.locator('img[alt$="contribution graph"]').evaluate((img) => {
    const box = img.parentElement!;
    return {
      scrolls: box.scrollWidth > box.clientWidth,
      imgRight: img.getBoundingClientRect().right,
      boxRight: box.getBoundingClientRect().right,
    };
  });
  expect(edges.scrolls).toBe(true);
  // The right end of the image (this month) is in view, not clipped
  expect(edges.imgRight).toBeLessThanOrEqual(edges.boxRight);
  expect(edges.imgRight).toBeGreaterThan(edges.boxRight - 40);
});

test("the footer links to the resume", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator("footer").getByRole("link", { name: /Resume/ }),
  ).toHaveAttribute("href", "/resume");
});

test("the home page describes its author as structured data", async ({ page }) => {
  await page.goto("/");
  const jsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent())!,
  );
  expect(jsonLd).toMatchObject({ "@type": "Person", name: "Aman Mehtar" });
  expect(jsonLd.sameAs).toContain("https://github.com/amanmprojects");
});

test("keyboard focus shows a visible ring", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement!);
    return `${style.outlineStyle} ${style.outlineWidth}`;
  });
  expect(outline).toBe("solid 2px");
});
