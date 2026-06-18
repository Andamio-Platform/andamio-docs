#!/usr/bin/env tsx
/**
 * Guard: no level-1 heading in MDX bodies.
 *
 * In Fumadocs the page title comes from frontmatter `title:` and is rendered
 * by <DocsTitle>. An `# H1` in the MDX body therefore renders a SECOND title,
 * producing the duplicate-heading look. The rule is simple and absolute:
 *
 *   The body of a docs MDX file must never contain a level-1 (`# `) heading.
 *   Page titles live in frontmatter; in-content sections start at `## ` (h2).
 *
 * Usage:
 *   npx tsx scripts/check-doc-headings.ts          # report + exit 1 if any
 *   npx tsx scripts/check-doc-headings.ts --fix     # strip duplicate body H1s
 *
 * Runs automatically before every build via the `prebuild` npm script, so a
 * duplicate heading fails `next build` (locally and in CI/Vercel).
 */
import fs from "fs";
import path from "path";

const FIX = process.argv.includes("--fix");
const CONTENT_ROOT = path.join("content", "docs");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && full.endsWith(".mdx")) out.push(full);
  }
  return out;
}

interface Offense {
  file: string;
  line: number; // 1-based, original file
  text: string;
}

/** Return the 1-based line indices of body-level H1s (outside frontmatter + code fences). */
function findBodyH1s(source: string): { line: number; text: string }[] {
  const lines = source.split("\n");
  const hits: { line: number; text: string }[] = [];

  // Locate frontmatter: a leading `---` ... `---` block.
  let bodyStart = 0;
  if (lines[0]?.trim() === "---") {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        bodyStart = i + 1;
        break;
      }
    }
  }

  let inFence = false;
  for (let i = bodyStart; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    // Level-1 heading only: a single `#` followed by whitespace then content.
    if (/^#\s+\S/.test(line)) {
      hits.push({ line: i + 1, text: line.trim() });
    }
  }
  return hits;
}

/** Remove body H1 lines (and a single trailing blank) from the source. */
function stripBodyH1s(source: string): string {
  const h1Lines = new Set(findBodyH1s(source).map((h) => h.line));
  if (h1Lines.size === 0) return source;
  const lines = source.split("\n");
  const kept: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (h1Lines.has(i + 1)) {
      // Drop the H1 line; also drop one immediately-following blank line.
      if (lines[i + 1] !== undefined && lines[i + 1].trim() === "") i++;
      continue;
    }
    kept.push(lines[i]);
  }
  return kept.join("\n");
}

const files = walk(CONTENT_ROOT);
const offenses: Offense[] = [];
let fixedFiles = 0;

for (const file of files) {
  const source = fs.readFileSync(file, "utf-8");
  const hits = findBodyH1s(source);
  if (hits.length === 0) continue;

  if (FIX) {
    fs.writeFileSync(file, stripBodyH1s(source));
    fixedFiles++;
  } else {
    for (const h of hits) offenses.push({ file, line: h.line, text: h.text });
  }
}

if (FIX) {
  console.log(`✓ Stripped duplicate body H1s from ${fixedFiles} file(s).`);
  console.log("  Page titles remain in frontmatter (rendered by <DocsTitle>).");
  process.exit(0);
}

if (offenses.length > 0) {
  console.error(
    `\n✗ ${offenses.length} duplicate body heading(s) found across ${
      new Set(offenses.map((o) => o.file)).size
    } file(s).\n`
  );
  console.error(
    "  In Fumadocs the page title comes from frontmatter `title:`. A `# H1`\n" +
      "  in the body renders a SECOND title (the amateurish duplicate look).\n" +
      "  Remove the body H1 — sections start at `## ` (h2). Auto-fix:\n\n" +
      "      npm run docs-headings:fix\n"
  );
  for (const o of offenses) {
    console.error(`  ${o.file}:${o.line}  ${o.text.slice(0, 60)}`);
  }
  console.error("");
  process.exit(1);
}

console.log(`✓ No duplicate body headings in ${files.length} MDX files.`);
process.exit(0);
