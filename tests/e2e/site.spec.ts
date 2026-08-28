import { expect, test } from "@playwright/test";

test("mobile navigation exposes named, usable links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "Primary" });
  for (const name of ["Home", "Writing", "Stuff"]) {
    const link = navigation.getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  await navigation.getByRole("link", { name: "Writing", exact: true }).click();
  await expect(page).toHaveURL(/\/writing$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Writing");
});

test("project and writing content are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "chat app", exact: true })).toHaveAttribute(
    "href",
    "https://github.com/amanmprojects/chat-app",
  );

  await page.goto("/writing/hello-world");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hello, world");
  await expect(page.locator("article script")).toHaveCount(0);
});

test("obsolete guestbook route is not published", async ({ request }) => {
  const response = await request.get("/guestbook");
  expect(response.status()).toBe(404);
});
