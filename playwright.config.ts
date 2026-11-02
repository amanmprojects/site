import { defineConfig, devices } from "@playwright/test";

// BASE_URL points the suite at a server you already started (for example a
// production build: `npm run build && npm start`); otherwise it starts dev.
const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
// CHROMIUM_PATH uses a system Chromium instead of `npx playwright install`.
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "line",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
