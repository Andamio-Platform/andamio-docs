import { defineCollection, defineConfig } from "@content-collections/core";
import {
  frontmatterSchema,
  metaSchema,
  transformMDX,
} from "@fumadocs/content-collections/configuration";
import { z } from "zod";

const docs = defineCollection({
  name: "docs",
  directory: "content/docs",
  include: "**/*.mdx",
  schema: frontmatterSchema.extend({
    tags: z.array(z.string()).optional(),
    // Product's alignment stamp, read by product-circle's scripts/docs_watch.py.
    // verified_at: the andamio-api commit this page was last read against. Set it
    // only after reading the page against that contract; a page without it is
    // reported as unvouched. sources: the product-circle documents the page draws
    // from, as repo-relative paths; a change to one prompts a re-read.
    verified_at: z.string().optional(),
    sources: z.array(z.string()).optional(),
  }),
  transform: transformMDX,
});

const metas = defineCollection({
  name: "meta",
  directory: "content/docs",
  include: "**/meta.json",
  parser: "json",
  schema: metaSchema,
});

export default defineConfig({
  collections: [docs, metas],
});
