import fs from "fs";
import path from "path";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const postSlugs = fs
  .readdirSync(path.join(process.cwd(), "content", "writing"))
  .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
  .map((f) => f.replace(/\.md$/, ""));

export const pageRoutes = [
  "/",
  "/writing",
  "/stuff",
  ...postSlugs.map((slug) => `/writing/${slug}`),
];

/** Collects console errors and uncaught exceptions for the page's lifetime. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

export async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    // Chromium and Firefox already make overflowing <pre> blocks
    // keyboard-scrollable; axe still asks for tabindex on each one.
    .disableRules(["scrollable-region-focusable"])
    .exclude("nextjs-portal")
    .analyze();
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(summary).toEqual([]);
}

/** Elements wider than the viewport that aren't inside a scroll container. */
export async function overflowingElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders: string[] = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.getBoundingClientRect().right <= width + 1) continue;
      let parent = el.parentElement;
      let clipped = false;
      while (parent) {
        if (getComputedStyle(parent).overflowX !== "visible") {
          clipped = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (!clipped) offenders.push(el.outerHTML.slice(0, 80));
    }
    return offenders;
  });
}
