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
    tx_file: z.string().optional(),
    validator_system: z.string().optional(),
    validator_id: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.array(z.string()).optional(),
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
