import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import type { TOCItemType } from "fumadocs-core/server";

// Extended page data interface to include validator properties
interface ExtendedPageData {
  content: string;
  title: string;
  description?: string;
  icon?: string;
  full?: boolean;
  tx_file?: string;
  validator_system?: string;
  validator_id?: string | string[];
  tags?: string[];
  "access-level"?: string;
  _meta: Record<string, unknown>;
  body: string;
  toc: TOCItemType[];
  structuredData: Record<string, unknown>;
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // Cast page data to our extended interface
  const pageData = page.data as ExtendedPageData;

  const docsWidth = "";

  // Helper function to get access level badge styles
  const getAccessLevelBadge = (level: string) => {
    const badges = {
      public: {
        color: "bg-primary/10 text-primary border border-primary/20",
        label: "Public",
      },
      private: {
        color: "bg-destructive/10 text-destructive border border-destructive/20",
        label: "Private",
      },
      internal: {
        color: "bg-muted text-muted-foreground border border-border",
        label: "Internal",
      },
    };
    return badges[level as keyof typeof badges] || badges.public;
  };

  return (
    <DocsPage
      full={pageData.full}
      // On full-width pages, drop Fumadocs' default article max-width (1120px)
      // so the content can span the whole content area. Gated on `full`, so
      // only pages that opt in are affected; every other page is unchanged.
      article={pageData.full ? { className: "max-w-none" } : undefined}
    >
      <DocsTitle>{pageData.title}</DocsTitle>
      <DocsDescription>{pageData.description}</DocsDescription>
      {(pageData.tags && pageData.tags.length > 0) || pageData["access-level"] ? (
        <div className="flex flex-wrap gap-2 mb-4 not-prose">
          {pageData["access-level"] && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getAccessLevelBadge(pageData["access-level"]).color}`}
            >
              {getAccessLevelBadge(pageData["access-level"]).label}
            </span>
          )}
          {pageData.tags && pageData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <DocsBody className={docsWidth}>
        <MDXContent
          code={pageData.body}
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
