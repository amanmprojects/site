"use client";

import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function currentTheme(): Theme {
  const pinned = document.documentElement.dataset.theme;
  return pinned === "light" || pinned === "dark" ? pinned : systemTheme();
}

function setTheme(next: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme-switching", "");
  // Picking the OS theme clears the override so later OS changes apply again
  try {
    if (next === systemTheme()) {
      delete root.dataset.theme;
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      root.dataset.theme = next;
      localStorage.setItem(THEME_STORAGE_KEY, next);
    }
  } catch {
    root.dataset.theme = next;
  }
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute("data-theme-switching")),
  );
}

/**
 * Switches between light and dark. CSS decides which label and icon show, so
 * the server render is already right and nothing flips after hydration. The
 * visible label ("Dark theme" / "Light theme") is also the accessible name.
 */
export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      data-sidebar-item
      onClick={() => setTheme(currentTheme() === "dark" ? "light" : "dark")}
      className={className}
    >
      <span className="sr-only text-[15px] font-medium md:not-sr-only">
        <span className="dark:hidden">
          Dark<span className="sr-only"> theme</span>
        </span>
        <span className="hidden dark:inline">
          Light<span className="sr-only"> theme</span>
        </span>
      </span>
      <span className="grid h-5 w-5 shrink-0 place-items-center">
        {/* Moon in light mode, sun in dark mode */}
        <svg
          className="fill-current dark:hidden"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="19"
          height="19"
          aria-hidden
        >
          <path
            fillOpacity=".16"
            d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8Z"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8Z"
          />
        </svg>
        <svg
          className="hidden fill-current dark:block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          aria-hidden
        >
          <circle fillOpacity=".16" cx="12" cy="12" r="4.5" />
          <circle
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            cx="12"
            cy="12"
            r="4.5"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          />
        </svg>
      </span>
    </button>
  );
}
