import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/writing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/stuff`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${site.url}${post.href}`,
    lastModified: `${post.dateISO}T00:00:00Z`,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...pages, ...posts];
}
