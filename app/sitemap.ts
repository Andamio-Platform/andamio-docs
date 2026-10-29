import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/site";

// Every public docs page comes from the Fumadocs source, so a new MDX page is
// listed without touching this file. API routes and the internal /validators
// diagram pages are not in the source and stay out. `/` redirects to /docs,
// so it is not listed.
export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({ url: `${SITE_URL}${page.url}` }));
}
