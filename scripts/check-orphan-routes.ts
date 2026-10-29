#!/usr/bin/env tsx
/**
 * Guard: every docs page must be reachable from the sidebar navigation.
 *
 * The docs have three sidebar roots (Andamio Issuer, Andamio API, Protocol)
 * plus shared pages. The root `content/docs/meta.json` lists the shared pages
 * (`index`, `glossary`, `developer-community`) and the three root folders:
 * `issuer`, and the group folders `(developer)` and `(protocol)`. A group
 * folder's name is dropped from URLs, so `(developer)/api/index.mdx` serves
 * `/docs/api`. Each root folder carries `root: true` and its own `meta.json`.
 *
 * A page can silently fall out of nav: an `.mdx` lands on disk but nobody adds
 * it to the relevant `meta.json` `pages[]`, so it is reachable only by a direct
 * URL, an in-content link, or search — never from the sidebar. That is an
 * orphaned route, and it is exactly the kind of breakage this guard prevents.
 *
 * Algorithm (ported from the orch reference `find-orphan-routes.py`):
 *   Traverse the meta.json tree from the root, honoring explicit `pages[]`
 *   entries, the `...` rest operator, nested folder refs (including `(group)`
 *   folders), deep path refs, and a folder's own `index.mdx` group-landing.
 *   A `root: true` folder is reachable only when its parent `meta.json` lists
 *   it: Fumadocs builds tree nodes only for listed entries, so an unlisted
 *   root has no tab and no sidebar. Collect every reachable `.mdx`. A folder
 *   with no `meta.json` is fully shown by Fumadocs, so everything under it is
 *   reachable. Diff the reachable set against every `.mdx` under
 *   `content/docs`; the remainder is orphaned.
 *
 * It also fails when two files map to the same URL. Group folders make that
 * easy (an `index.mdx` directly in `(developer)/` would serve `/docs` and
 * silently shadow the home page), and Fumadocs reports no error for it.
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
  // Group folders like `(developer)` do not appear in URLs.
  rel = rel
    .split(path.sep)
    .filter((seg) => !/^\(.+\)$/.test(seg))
    .join("/");
  if (rel === "") rel = "index";
  return rel !== "index" ? `/docs/${rel}` : "/docs";
}

// Main root traversal.
reachFolder(CONTENT_ROOT);

const everyMdx = new Set(allMdx(CONTENT_ROOT).map((p) => realpath(p)));

const byRoute = new Map<string, string[]>();
for (const p of everyMdx) {
  const r = route(p);
  byRoute.set(r, [...(byRoute.get(r) ?? []), p]);
}
const collisions = [...byRoute].filter(([, files]) => files.length > 1);
if (collisions.length > 0) {
  console.error(`\n✗ ${collisions.length} URL collision(s): files that serve the same route.\n`);
  for (const [r, files] of collisions) {
    console.error(`  ${r}`);
    for (const f of files) console.error(`    ${path.relative(process.cwd(), f)}`);
  }
  console.error("");
  process.exit(1);
}
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
      "  folder's meta.json pages[] (nor reachable via `...` or a group index).\n" +
      "  A `root: true` folder must itself be listed in its parent meta.json.\n" +
      "  It is reachable only by direct URL or search.\n" +
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
