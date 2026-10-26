import { expect, test, type Page } from "@playwright/test";

const LIGHT_BG = "rgb(251, 251, 249)";
const DARK_BG = "rgb(19, 19, 17)";

function background(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

function storedTheme(page: Page) {
  return page.evaluate(() => localStorage.getItem("theme"));
}

test("follows the OS color scheme, live, until a choice is made", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  expect(await background(page)).toBe(LIGHT_BG);

  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => background(page)).toBe(DARK_BG);
});

test("the toggle switches theme and the choice survives reloads and navigation", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });

  await nav.getByRole("button", { name: "Dark theme" }).click();
  await expect.poll(() => background(page)).toBe(DARK_BG);
  expect(await storedTheme(page)).toBe("dark");
  await expect(nav.getByRole("button", { name: "Light theme" })).toBeVisible();

  await page.reload();
  expect(await background(page)).toBe(DARK_BG);

  await nav.getByRole("link", { name: "Writing", exact: true }).click();
  await expect(page).toHaveURL(/\/writing$/);
  expect(await background(page)).toBe(DARK_BG);

  // Going back to the OS theme drops the override instead of pinning light
  await nav.getByRole("button", { name: "Light theme" }).click();
  await expect.poll(() => background(page)).toBe(LIGHT_BG);
  expect(await storedTheme(page)).toBeNull();
  expect(await page.locator("html").getAttribute("data-theme")).toBeNull();
});

test("a saved choice overrides the OS", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  await page.goto("/");
  expect(await background(page)).toBe(LIGHT_BG);
  await expect(
    page.getByRole("button", { name: "Dark theme" }),
  ).toBeVisible();
});

test("the saved theme applies before any app JavaScript runs", async ({ page }) => {
  // With every Next.js chunk blocked React never hydrates, so only the inline
  // <head> script can have set the theme. This is what prevents a flash.
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/");
  expect(await page.locator("html").getAttribute("data-theme")).toBe("dark");
  expect(await background(page)).toBe(DARK_BG);
});

test("a corrupt saved value is ignored", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => localStorage.setItem("theme", "purple"));
  await page.goto("/");
  expect(await page.locator("html").getAttribute("data-theme")).toBeNull();
  expect(await background(page)).toBe(LIGHT_BG);
});

test("browser chrome color matches each scheme", async ({ page }) => {
  await page.goto("/");
  const colors = await page
    .locator('meta[name="theme-color"]')
    .evaluateAll((metas) =>
      metas.map((m) => `${m.getAttribute("media")} ${m.getAttribute("content")}`),
    );
  expect(colors).toEqual([
    "(prefers-color-scheme: light) #fbfbf9",
    "(prefers-color-scheme: dark) #131311",
  ]);
});

test("the toggle is a full-size tap target in the mobile bar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Dark theme" });
  await expect(toggle).toBeVisible();
  const box = await toggle.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
});
