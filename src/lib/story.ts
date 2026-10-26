import type { StoryItem } from "@/lib/site";

export type StorySegment =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string };

/**
 * Splits a story line into plain text and links. Labels match
 * case-insensitively ("minihub" links "Minihub") and the displayed text keeps
 * the line's own casing. Links are matched in order, left to right.
 */
export function splitStory(item: StoryItem): StorySegment[] {
  const segments: StorySegment[] = [];
  const lower = item.text.toLowerCase();
  let cursor = 0;

  for (const link of item.links ?? []) {
    const idx = lower.indexOf(link.label.toLowerCase(), cursor);
    if (idx === -1) continue;
    if (idx > cursor) {
      segments.push({ kind: "text", text: item.text.slice(cursor, idx) });
    }
    const end = idx + link.label.length;
    segments.push({ kind: "link", text: item.text.slice(idx, end), href: link.href });
    cursor = end;
  }

  if (cursor < item.text.length) {
    segments.push({ kind: "text", text: item.text.slice(cursor) });
  }
  return segments;
}
