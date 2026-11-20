import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { pageMarkdown } from "@/lib/llms";

// One docs page as markdown. next.config.mjs rewrites /docs/<page>.md and
// /docs/<page>.mdx here. Every page is built at build time; any other slug 404s.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return new Response(pageMarkdown(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
