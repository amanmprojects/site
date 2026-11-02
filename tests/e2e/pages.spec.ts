import { expect, test } from "@playwright/test";
import {
  expectNoAxeViolations,
  overflowingElements,
  pageRoutes,
  trackErrors,
} from "./helpers";

for (const route of pageRoutes) {
  test.describe(`page ${route}`, () => {
    test("renders on a phone without errors or sideways scrolling", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      const errors = trackErrors(page);
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await overflowingElements(page)).toEqual([]);
      expect(errors).toEqual([]);
    });

    for (const colorScheme of ["light", "dark"] as const) {
      test(`has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        // Reduced motion skips the fade-in, which would skew contrast checks
        await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
        await page.goto(route);
        await expectNoAxeViolations(page);
      });
    }
  });
}
