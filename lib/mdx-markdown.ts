import { ISSUER_CARD_COMPONENTS, renderIssuerCard } from "./issuer-actions-markdown";
import { fencedLines, maskFences, scanJsxTags, skipJsToken } from "./jsx-scan";
import { SITE_URL } from "./site";

/* Turns a page's MDX body into plain markdown for agents:
   - top-level import/export statements go;
   - the Issuer card tags become markdown written from their data;
   - components whose children are plain text (Callout, Card, Steps…) stay as
     written; every other component becomes one line pointing at the HTML page;
   - links to docs pages point at their markdown form.
   Fenced code is never touched, so a code sample that starts with `import` or
   holds a tag survives. */

/* Components whose content is the text between their tags: kept as written. */
const TEXT_WRAPPERS = new Set(["Callout", "Card", "Cards", "Step", "Steps", "Tab", "Tabs"]);

/** Apply `fn` to each stretch of `mdx` outside fenced code blocks. */
function mapOutsideFences(mdx: string, fn: (text: string) => string): string {
  const fenced = fencedLines(mdx);
  const lines = mdx.split("\n");
  const out: string[] = [];
  let chunk: string[] = [];
  const flush = () => {
    if (chunk.length) out.push(fn(chunk.join("\n")));
    chunk = [];
  };
  lines.forEach((line, i) => {
    if (fenced[i]) {
      flush();
      out.push(line);
    } else {
      chunk.push(line);
    }
  });
  flush();
  return out.join("\n");
}

/** Drop the frontmatter from a raw `.mdx` file. Page content from the source
    has none. */
export function stripFrontmatter(mdx: string): string {
  return mdx.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

/* An MDX import/export statement starts at column 0 at the start of a block
   (after a blank line or another statement) and runs to the first line end
   where its brackets balance. Brackets inside strings, template literals and
   comments do not count. */
function stripEsm(text: string): string {
  let out = "";
  let i = 0;
  let startsBlock = true;
  while (i < text.length) {
    const nl = text.indexOf("\n", i);
    const lineEnd = nl === -1 ? text.length : nl;
    const line = text.slice(i, lineEnd);
    if (!startsBlock || !/^(import|export)\s/.test(line)) {
      out += text.slice(i, lineEnd + 1);
      startsBlock = line.trim() === "";
      i = lineEnd + 1;
      continue;
    }
    let depth = 0;
    let j = i;
    while (j < text.length) {
      const k = skipJsToken(text, j);
      if (k !== j) {
        j = k;
        continue;
      }
      const c = text[j];
      if ("{([".includes(c)) depth++;
      else if ("})]".includes(c)) depth--;
      else if (c === "\n" && depth <= 0) break;
      j++;
    }
    i = j + 1;
  }
  return out;
}

/* Index just past the `</name>` that closes the tag ending at `from`, counting
   nested tags of the same name, or -1. */
function closingTagEnd(masked: string, name: string, from: number): number {
  const re = new RegExp(`<(/?)${name.replace(".", "\\.")}\\b[^>]*?(/?)>`, "g");
  re.lastIndex = from;
  let depth = 1;
  for (let m = re.exec(masked); m; m = re.exec(masked)) {
    if (m[1]) depth--;
    else if (!m[2]) depth++;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

function replaceComponents(mdx: string, pointer: string): string {
  const masked = maskFences(mdx);
  let out = "";
  let cursor = 0;
  for (const tag of scanJsxTags(masked)) {
    if (tag.start < cursor || TEXT_WRAPPERS.has(tag.name)) continue;
    let replacement: string;
    let end = tag.end;
    if (ISSUER_CARD_COMPONENTS.includes(tag.name)) {
      const card = renderIssuerCard(tag);
      if ("problem" in card) throw new Error(`Issuer card markdown: ${card.problem}`);
      replacement = card.markdown;
    } else {
      if (!tag.selfClosing) {
        end = closingTagEnd(masked, tag.name, tag.end);
        if (end === -1) throw new Error(`No closing </${tag.name}> for the tag at ${tag.start}`);
      }
      replacement = pointer;
    }
    out += mdx.slice(cursor, tag.start) + replacement;
    cursor = end;
  }
  return out + mdx.slice(cursor);
}

/* `](/docs/…)` and `href="/docs/…"` → the absolute URL of that page's markdown
   form, keeping any `#anchor`. A path that is not a page (a redirected old URL)
   gets its absolute HTML URL, so the redirect still applies. */
function rewriteDocsLinks(text: string, isPage: (slugs: string[]) => boolean): string {
  return text.replace(
    /(\]\(|href=")\/docs((?:\/[^\s)"#?]*)?)(#[^\s)"]*)?(?=[\s)"])/g,
    (match, lead: string, rest: string, anchor = "") => {
      if (/\.mdx?$/.test(rest)) return match;
      const path = rest.replace(/\/+$/, "");
      const slugs = path.split("/").filter(Boolean);
      const url = `${SITE_URL}/docs${path}`;
      return `${lead}${isPage(slugs) ? `${url}.md` : url}${anchor}`;
    },
  );
}

/** A page's MDX body (no frontmatter) as plain markdown. `pageUrl` is the
    page's absolute HTML URL; `isPage` says whether docs slugs name a page. */
export function mdxToMarkdown(
  mdx: string,
  { pageUrl, isPage }: { pageUrl: string; isPage: (slugs: string[]) => boolean },
): string {
  const noEsm = mapOutsideFences(mdx, stripEsm);
  const expanded = replaceComponents(noEsm, `> Interactive content: see ${pageUrl}`);
  return mapOutsideFences(expanded, (text) =>
    rewriteDocsLinks(text, isPage).replace(/\n{3,}/g, "\n\n"),
  ).trim();
}
