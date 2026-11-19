/**
 * Merged pull requests in other people's projects, shown on /oss.
 * Stars are a snapshot from when the list was last updated.
 */

export type Contribution = {
  title: string;
  number: number;
  /** Merge date, "YYYY-MM-DD" */
  merged: string;
};

export type OssProject = {
  repo: string;
  name: string;
  description: string;
  stars: number;
  prs: Contribution[];
};

export const ossUpdated = "2026-11-19";

export const ossProjects: OssProject[] = [
  {
    repo: "storytold/pdfcraft",
    name: "PdfCraft",
    description: "A PDF reader and editor written from scratch in Rust.",
    stars: 21216,
    prs: [
      {
        title: "Keep an edited line together across subsets of the same font",
        number: 3697,
        merged: "2026-10-22",
      },
      {
        title: "Accept Identity CJK Unicode mappings in accessibility checks",
        number: 3721,
        merged: "2026-10-22",
      },
    ],
  },
  {
    repo: "am-will/gooey-pi",
    name: "gooey-pi",
    description: "A desktop workspace for Pi, OMP and Prime Agent.",
    stars: 981,
    prs: [
      {
        title: "Show when the Files panel truncates, instead of silently dropping entries",
        number: 228,
        merged: "2026-10-21",
      },
      {
        title: "Handle trailing-slash git status records for untracked directories",
        number: 227,
        merged: "2026-10-21",
      },
    ],
  },
  {
    repo: "am-will/limux",
    name: "limux",
    description: "A GPU-accelerated terminal multiplexer for Linux.",
    stars: 565,
    prs: [
      {
        title: "Local Flatpak build that can open host terminals",
        number: 197,
        merged: "2026-10-19",
      },
    ],
  },
  {
    repo: "L0adn9/omaface",
    name: "omaFace",
    description: "Face unlock for Omarchy: lock screen, login, sudo and system prompts.",
    stars: 34,
    prs: [
      {
        title: "Stop the scan when a model gives NaN instead of counting it as a pass",
        number: 9,
        merged: "2026-11-06",
      },
      {
        title: "Build the plugin on Omarchy 4.5.0, which dropped LockFeedSurface.qml",
        number: 8,
        merged: "2026-11-06",
      },
      {
        title: "Support Omarchy 4.0 and 4.5 shell plugin sources",
        number: 3,
        merged: "2026-10-23",
      },
      {
        title: "Wrap long test result messages in Settings",
        number: 1,
        merged: "2026-10-21",
      },
    ],
  },
];

export const repoUrl = (repo: string) => `https://github.com/${repo}`;
export const prUrl = (repo: string, number: number) =>
  `https://github.com/${repo}/pull/${number}`;

/** 21216 → "21.2K" */
export function formatStars(stars: number): string {
  if (stars < 1000) return String(stars);
  return `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}K`;
}
