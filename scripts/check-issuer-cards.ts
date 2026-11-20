#!/usr/bin/env tsx
/**
 * Guard: every Issuer card tag in the docs has a markdown form.
 *
 * Each docs page is also served as markdown for agents (app/llms.mdx). The
 * Issuer card components (components/mdx/issuer-actions.tsx) render data from
 * lib/issuer-actions-data.ts, so their markdown form is written from the same
 * data by lib/issuer-actions-markdown.ts. That serializer knows each card tag
 * and its exact props. A new card component, or a card tag with props it does
 * not know, would otherwise leave the markdown with a bare tag and no content.
 *
 * Fails when:
 *   - mdx-components.tsx registers a component from issuer-actions.tsx that the
 *     serializer has no form for (or the import cannot be found);
 *   - any page uses a card tag with props the serializer does not know, or
 *     not self-closing.
 *
 * Usage:
 *   npx tsx scripts/check-issuer-cards.ts
 *
 * Runs automatically before every build via the `prebuild` npm script.
 */
import fs from "fs";
import path from "path";
import { ISSUER_CARD_COMPONENTS, renderIssuerCard } from "../lib/issuer-actions-markdown";
import { maskFences, scanJsxTags } from "../lib/jsx-scan";
import { stripFrontmatter } from "../lib/mdx-markdown";

const CONTENT_ROOT = path.join("content", "docs");
const REGISTRY = "mdx-components.tsx";

const problems: string[] = [];

// The card components pages can use: what the MDX registry imports from
// components/mdx/issuer-actions.
const registered = fs
  .readFileSync(REGISTRY, "utf8")
  .match(/import\s*\{([^}]*)\}\s*from\s*["']@\/components\/mdx\/issuer-actions["']/);
if (!registered) {
  problems.push(`${REGISTRY}: no import from @/components/mdx/issuer-actions found`);
} else {
  const names = registered[1]
    .split(",")
    .map((n) => n.trim().split(/\s+as\s+/).pop() ?? "")
    .filter(Boolean);
  for (const name of names) {
    if (!ISSUER_CARD_COMPONENTS.includes(name)) {
      problems.push(`${REGISTRY}: <${name}> has no markdown form in lib/issuer-actions-markdown.ts`);
    }
  }
}

function mdxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return mdxFiles(p);
    return e.name.endsWith(".mdx") ? [p] : [];
  });
}

let tags = 0;
for (const file of mdxFiles(CONTENT_ROOT)) {
  const mdx = maskFences(stripFrontmatter(fs.readFileSync(file, "utf8")));
  for (const tag of scanJsxTags(mdx)) {
    if (!ISSUER_CARD_COMPONENTS.includes(tag.name)) continue;
    tags++;
    const card = renderIssuerCard(tag);
    if ("problem" in card) problems.push(`${file}: ${card.problem}`);
  }
}

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} Issuer card tag(s) with no markdown form.\n`);
  console.error(
    "  Each docs page is also served as markdown, where these cards are written\n" +
      "  out from lib/issuer-actions-data.ts. Use a tag form listed below, or add\n" +
      "  the new form to RENDER in lib/issuer-actions-markdown.ts.\n",
  );
  for (const p of problems) console.error(`  ${p}`);
  console.error("");
  process.exit(1);
}

console.log(`✓ Issuer cards: all ${tags} card tag(s) have a markdown form.`);
process.exit(0);
