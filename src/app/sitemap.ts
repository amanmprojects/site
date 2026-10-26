import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const allPosts = getAllPosts();
  // The home page and /writing both list posts, so they change with the newest
  const latest = allPosts[0] && `${allPosts[0].dateISO}T00:00:00Z`;

  const pages: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: latest,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/writing`,
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: `${site.url}/stuff`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const posts: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${site.url}${post.href}`,
    lastModified: `${post.dateISO}T00:00:00Z`,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...pages, ...posts];
}
