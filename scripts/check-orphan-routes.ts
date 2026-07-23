#!/usr/bin/env tsx
/**
 * Guard: every docs page must be reachable from the sidebar navigation.
 *
 * The docs use a six-root IA — a single collapsible Fumadocs sidebar whose root
 * `content/docs/meta.json` lists each top-level tab folder (`api`, `issuer`,
 * `apps-tooling`, `credential-badges`, `developer-community`, `protocol`, plus
 * `glossary`/`light-paper` and the trust/verification pages) in its `pages[]`.
 * Each tab folder then carries its own `meta.json` nav tree.
 *
 * A page can silently fall out of nav: an `.mdx` lands on disk but nobody adds
 * it to the relevant `meta.json` `pages[]`, so it is reachable only by a direct
 * URL, an in-content link, or search — never from the sidebar. That is an
 * orphaned route, and it is exactly the kind of breakage this guard prevents.
 *
 * Algorithm (ported from the orch reference `find-orphan-routes.py`):
 *   Traverse the meta.json tree from the root, honoring explicit `pages[]`
 *   entries, the `...` rest operator, nested folder refs, deep path refs, a
 *   folder's own `index.mdx` group-landing, and any folder marked `root: true`
 *   (a separate sidebar tab). Collect every reachable `.mdx`. A folder with no
 *   `meta.json` is fully shown by Fumadocs, so everything under it is reachable.
 *   Diff the reachable set against every `.mdx` under `content/docs`; the
 *   remainder is orphaned.
 *
 * Usage:
 *   npx tsx scripts/check-orphan-routes.ts     # report + exit 1 on any orphan
 *
 * Runs automatically before every build via the `prebuild` npm script, so an
 * orphaned page fails `next build` (locally and in CI/Vercel).
 */
import fs from "fs";
import path from "path";

const CONTENT_ROOT = path.join("content", "docs");

interface Meta {
  pages?: unknown;
  root?: unknown;
}

function loadMeta(dir: string): Meta | null {
  const p = path.join(dir, "meta.json");
  if (fs.existsSync(p) && fs.statSync(p).isFile()) {
    try {
      return JSON.parse(fs.readFileSync(p, "utf8")) as Meta;
    } catch {
      return null;
    }
  }
  return null;
}

const reached = new Set<string>(); // canonical .mdx paths reachable from the sidebar

function realpath(p: string): string {
  return fs.realpathSync(p);
}

function reachEntry(basedir: string, slug: string, listed: Set<string>): void {
  listed.add(slug.split("/")[0]);
  const tdir = path.join(basedir, slug);
  const tmdx = path.join(basedir, `${slug}.mdx`);
  if (fs.existsSync(tdir) && fs.statSync(tdir).isDirectory()) {
    reachFolder(tdir);
  } else if (fs.existsSync(tmdx) && fs.statSync(tmdx).isFile()) {
    reached.add(realpath(tmdx));
  }
}

function reachFolder(dirpath: string): void {
  // The folder's own index is the group landing → reachable.
  const idx = path.join(dirpath, "index.mdx");
  if (fs.existsSync(idx) && fs.statSync(idx).isFile()) {
    reached.add(realpath(idx));
  }

  const meta = loadMeta(dirpath);
  if (meta && Array.isArray(meta.pages)) {
    const pages = meta.pages as string[];
    const listed = new Set<string>();
    for (const p of pages) {
      if (typeof p !== "string") continue;
      // Skip the rest operator, separator labels (`--- ... ---`), and
      // external/markdown link entries (`[Label](url)`).
      if (p === "..." || p.startsWith("---") || p.startsWith("[")) continue;
      reachEntry(dirpath, p, listed);
    }
    if (pages.includes("...")) {
      for (const name of fs.readdirSync(dirpath).sort()) {
        if (name === "meta.json") continue;
        const full = path.join(dirpath, name);
        const slug = name.endsWith(".mdx") ? name.slice(0, -4) : name;
        if (slug === "index" || listed.has(slug)) continue;
        if (fs.statSync(full).isDirectory()) {
          reachFolder(full);
        } else if (name.endsWith(".mdx")) {
          reached.add(realpath(full));
        }
      }
    }
  } else {
    // No meta → Fumadocs shows everything under this folder.
    for (const name of fs.readdirSync(dirpath)) {
      if (name === "meta.json") continue;
      const full = path.join(dirpath, name);
      if (fs.statSync(full).isDirectory()) {
        reachFolder(full);
      } else if (name.endsWith(".mdx")) {
        reached.add(realpath(full));
      }
    }
  }
}

/** Recursively collect every directory under `root` (inclusive). */
function allDirs(root: string): string[] {
  const out = [root];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...allDirs(path.join(root, entry.name)));
  }
  return out;
}

/** Recursively collect every .mdx file under `root`. */
function allMdx(root: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...allMdx(full));
    else if (entry.isFile() && full.endsWith(".mdx")) out.push(full);
  }
  return out;
}

/** Map an absolute .mdx path to its public route (mirrors Fumadocs). */
function route(p: string): string {
  let rel = path.relative(realpath(CONTENT_ROOT), p).slice(0, -4); // strip .mdx
  if (rel.endsWith(`${path.sep}index`)) rel = rel.slice(0, -6);
  rel = rel.split(path.sep).join("/");
  return rel !== "index" ? `/docs/${rel}` : "/docs";
}

// Main root traversal.
reachFolder(CONTENT_ROOT);

// Folders marked `root: true` are separate sidebar tabs — reachable via the tab
// switcher even when not listed in the main root's pages[].
for (const d of allDirs(CONTENT_ROOT)) {
  const meta = loadMeta(d);
  if (meta && meta.root === true) reachFolder(d);
}

const everyMdx = new Set(allMdx(CONTENT_ROOT).map((p) => realpath(p)));
const orphans = [...everyMdx]
  .filter((p) => !reached.has(p))
  .map((p) => route(p))
  .sort();

if (orphans.length > 0) {
  console.error(
    `\n✗ ${orphans.length} orphaned route(s): pages on disk not reachable ` +
      `from any sidebar nav tree.\n`
  );
  console.error(
    "  Each page below exists as an .mdx file but is not referenced by its\n" +
      "  folder's meta.json pages[] (nor reachable via `...`, a group index,\n" +
      "  or a `root: true` tab). It is reachable only by direct URL or search.\n" +
      "  Add it to the relevant content/docs/**/meta.json pages[] to fix.\n"
  );
  for (const r of orphans) console.error(`  ${r}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ No orphaned routes: all ${everyMdx.size} docs pages are reachable ` +
    `from the sidebar nav.`
);
process.exit(0);
