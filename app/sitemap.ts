import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/site";

// Every public docs page comes from the Fumadocs source, so a new MDX page is
// listed without touching this file. API routes and the internal /validators
// diagram pages are not in the source and stay out.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL },
    ...source.getPages().map((page) => ({ url: `${SITE_URL}${page.url}` })),
  ];
}
