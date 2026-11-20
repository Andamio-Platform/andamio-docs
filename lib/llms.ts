import { flattenTree } from "fumadocs-core/server";
import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/site";
import { mdxToMarkdown } from "@/lib/mdx-markdown";

/* Text forms of the docs for agents: /llms.txt (an index), /llms-full.txt
   (every page), and each page as markdown at its URL plus `.md` or `.mdx`
   (rewritten to /llms.mdx/... in next.config.mjs). */

type DocPage = ReturnType<typeof source.getPages>[number];

/** Where a page's markdown form is served. */
function markdownUrl(page: DocPage): string {
  return `${SITE_URL}${page.url}.md`;
}

/** One page as markdown: its title as the heading, then its description and
    body. `withUrl` adds the page's address under the heading. */
export function pageMarkdown(page: DocPage, withUrl = false): string {
  const parts = [`# ${page.data.title}`];
  if (withUrl) parts.push(`URL: ${SITE_URL}${page.url}`);
  if (page.data.description) parts.push(`> ${page.data.description}`);
  const body = mdxToMarkdown(page.data.content, {
    pageUrl: `${SITE_URL}${page.url}`,
    isPage: (slugs) => source.getPage(slugs) !== undefined,
  });
  if (body) parts.push(body);
  return `${parts.join("\n\n")}\n`;
}

/* Pages in sidebar order: first the shared pages outside every root (Home,
   Glossary, Developer Community), then one group per sidebar root (Andamio
   Issuer, Andamio API, Protocol). Each root's sidebar also links Home and
   Glossary; they are listed once, under Shared. Pages in no sidebar come last,
   labelled as such. */
function pageSections(): { title: string; pages: DocPage[] }[] {
  const byUrl = new Map(source.getPages().map((p) => [p.url, p]));
  const seen = new Set<string>();
  const take = (urls: string[]) =>
    urls.flatMap((url) => {
      const page = byUrl.get(url);
      if (!page || seen.has(url)) return [];
      seen.add(url);
      return [page];
    });

  const top = source.pageTree.children;
  const isRoot = (n: (typeof top)[number]) => n.type === "folder" && n.root === true;
  const sections = [
    { title: "Shared", pages: take(flattenTree(top.filter((n) => !isRoot(n))).map((i) => i.url)) },
    ...top.filter(isRoot).map((node) => ({
      title: typeof node.name === "string" ? node.name : "Docs",
      pages: take(flattenTree([node]).map((i) => i.url)),
    })),
    { title: "Not in the sidebar", pages: take([...byUrl.keys()]) },
  ];
  return sections.filter((s) => s.pages.length > 0);
}

export function llmsIndex(): string {
  const lines = [
    "# Andamio Docs",
    "",
    "> Andamio lets groups of people issue, earn and verify proof of real learning, work and contribution, recorded on the Cardano blockchain. These docs cover Andamio Issuer, the Andamio API and the Andamio protocol.",
    "",
    `Every page below links to its markdown form: the page URL with \`.md\` added. [llms-full.txt](${SITE_URL}/llms-full.txt) has every page in one file.`,
  ];
  for (const section of pageSections()) {
    lines.push("", `## ${section.title}`, "");
    for (const page of section.pages) {
      const desc = page.data.description ? `: ${page.data.description}` : "";
      lines.push(`- [${page.data.title}](${markdownUrl(page)})${desc}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

export function llmsFull(): string {
  return pageSections()
    .flatMap((s) => s.pages)
    .map((page) => pageMarkdown(page, true))
    .join("\n---\n\n");
}
