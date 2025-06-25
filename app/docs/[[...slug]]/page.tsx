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
import TransactionDiagramClient from "@/components/react-flow/transactions/TransactionDiagramClient";
import ProtocolFlowClient from "@/components/react-flow/protocol/ProtocolFlowClient";
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
  _openapi?: Record<string, unknown>;
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

  const docsWidth =
    pageData.tx_file ||
    pageData.validator_system ||
    params.slug?.join("/") === "protocol/v1/validators"
      ? ""
      : "w-2/3";

  return (
    <DocsPage toc={pageData.toc} full={pageData.full}>
      <DocsTitle>{pageData.title}</DocsTitle>
      <DocsDescription>{pageData.description}</DocsDescription>
      <DocsBody className={docsWidth}>
        <MDXContent
          code={pageData.body}
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
        {pageData.tx_file && (
          <TransactionDiagramClient txFilePath={pageData.tx_file} />
        )}

        {/* Show protocol diagram only on the validators index page */}
        {/* TODO: Embed diagrams directly in MDX files by creating a custom component */}
        {params.slug?.join("/") === "protocol/v1/validators" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              Andamio Protocol Structure
            </h2>
            <ProtocolFlowClient />
          </div>
        )}
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
