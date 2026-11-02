import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./helpers";

for (const path of ["/does-not-exist", "/writing/nope", "/writing/nope/deeper"]) {
  test(`${path} shows the site's 404 page`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("Page not found · Aman Mehtar");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(
      page.getByRole("main").getByRole("heading", { level: 1 }),
    ).toHaveText("Page not found");
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });
}

test("the 404 page leads somewhere useful", async ({ page }) => {
  await page.goto("/does-not-exist");
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "← home" })).toHaveAttribute("href", "/");

  const firstPost = main.locator('a[href^="/writing/"]').first();
  const href = await firstPost.getAttribute("href");
  await firstPost.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByRole("article")).toBeVisible();
});

test("the 404 page has no axe violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/does-not-exist");
  await expectNoAxeViolations(page);
});
