import { describe, expect, it } from "vitest";
import { splitStory } from "@/lib/story";

describe("splitStory", () => {
  it("returns plain text when there are no links", () => {
    expect(splitStory({ text: "Just text." })).toEqual([
      { kind: "text", text: "Just text." },
    ]);
  });

  it("matches labels regardless of case and keeps the text's casing", () => {
    expect(
      splitStory({
        text: "Built Minihub in Go.",
        links: [{ label: "minihub", href: "https://example.com/m" }],
      }),
    ).toEqual([
      { kind: "text", text: "Built " },
      { kind: "link", text: "Minihub", href: "https://example.com/m" },
      { kind: "text", text: " in Go." },
    ]);
  });

  it("handles links at the start and end and several per line", () => {
    expect(
      splitStory({
        text: "GitHub and GitLab",
        links: [
          { label: "GitHub", href: "a" },
          { label: "GitLab", href: "b" },
        ],
      }),
    ).toEqual([
      { kind: "link", text: "GitHub", href: "a" },
      { kind: "text", text: " and " },
      { kind: "link", text: "GitLab", href: "b" },
    ]);
  });

  it("skips labels that are missing from the text", () => {
    expect(
      splitStory({ text: "Hello", links: [{ label: "absent", href: "x" }] }),
    ).toEqual([{ kind: "text", text: "Hello" }]);
  });

  it("never loses or duplicates characters", () => {
    const item = {
      text: "a chat app and another chat app",
      links: [
        { label: "chat app", href: "1" },
        { label: "chat app", href: "2" },
      ],
    };
    const segments = splitStory(item);
    expect(segments.map((s) => s.text).join("")).toBe(item.text);
    expect(segments.filter((s) => s.kind === "link")).toHaveLength(2);
  });
});
