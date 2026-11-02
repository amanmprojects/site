import { expect, test } from "@playwright/test";
import { postSlugs } from "./helpers";

test("paragraphs and code blocks in a post are spaced apart", async ({ page }) => {
  await page.goto("/writing/chess-two-ways");
  const gaps = await page.evaluate(() =>
    [...document.querySelectorAll(".prose > p + p, .prose > p + pre, .prose > pre + p")].map(
      (el) => parseFloat(getComputedStyle(el).marginTop),
    ),
  );
  expect(gaps.length).toBeGreaterThan(3);
  for (const gap of gaps) expect(gap).toBeGreaterThan(12);
});

test("headings link to themselves", async ({ page }) => {
  await page.goto("/writing/chess-two-ways");
  const heading = page.locator(".prose h2").first();
  const id = await heading.getAttribute("id");
  expect(id).toMatch(/^[a-z0-9-]+$/);

  await heading.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`#${id}$`));
  await expect(heading).toBeInViewport();
});

test("a deep link scrolls straight to its section", async ({ page }) => {
  await page.goto(
    "/writing/repurposing-jiofiber-wireless-repeater#act-2-the-impossible-verdict",
  );
  const heading = page.locator("#act-2-the-impossible-verdict");
  await expect(heading).toHaveText('Act 2: The "Impossible" Verdict');
  await expect(heading).toBeInViewport();
});

test("table columns keep their Markdown alignment", async ({ page }) => {
  await page.goto("/writing/amazon-pricing-qwen-lora");
  const aligns = await page.evaluate(() =>
    [...document.querySelectorAll(".prose table:first-of-type tr > *")].map(
      (cell) => getComputedStyle(cell).textAlign,
    ),
  );
  expect(aligns).toContain("right");
});

test("post header shows the date and reading time inside the article", async ({
  page,
}) => {
  await page.goto("/writing/minillm-101m-laptop");
  const article = page.getByRole("article");
  await expect(article.getByRole("heading", { level: 1 })).toHaveText(
    "Training a 101M language model on a laptop GPU",
  );
  await expect(article.locator("time")).toHaveAttribute("datetime", "2026-08-06");
  await expect(article).toContainText(/\d+ min read/);
});

test("newer and older links walk the archive in order", async ({ page }) => {
  await page.goto("/writing");
  const listed = await page
    .locator("main li a")
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  const [newest, second] = listed;
  const oldest = listed[listed.length - 1];

  await page.goto(newest!);
  const more = page.getByRole("navigation", { name: "More writing" });
  await expect(more.getByRole("link", { name: /Newer/ })).toHaveCount(0);
  await more.getByRole("link", { name: /Older/ }).click();
  await expect(page).toHaveURL(new RegExp(`${second}$`));

  await page.goto(oldest!);
  await expect(more.getByRole("link", { name: /Older/ })).toHaveCount(0);
  await expect(more.getByRole("link", { name: /Newer/ })).toHaveCount(1);
});

test("unknown posts are a 404", async ({ request }) => {
  for (const path of ["/writing/nope", "/writing/_template", "/writing/Hello-World"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

for (const slug of postSlugs) {
  test(`${slug} has its own share image and structured data`, async ({
    page,
    request,
  }) => {
    await page.goto(`/writing/${slug}`);
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    const twitterImage = await page
      .locator('meta[name="twitter:image"]')
      .getAttribute("content");
    expect(ogImage).toContain(`/writing/${slug}/opengraph-image`);
    expect(twitterImage).toBe(ogImage);

    const image = await request.get(new URL(ogImage!).pathname);
    expect(image.headers()["content-type"]).toBe("image/png");
    const png = await image.body();
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);

    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    expect(jsonLd["@type"]).toBe("BlogPosting");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      jsonLd.headline,
    );
  });
}
