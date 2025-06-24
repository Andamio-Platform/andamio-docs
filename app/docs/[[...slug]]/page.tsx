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
import DiagramValidatorOverview from "@/components/react-flow/validators/DiagramValidatorOverview";
import type { TOCItemType } from "fumadocs-core/server";
import SystemDiagram from "@/components/react-flow/validators/SystemDiagram";

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

  return (
    <DocsPage toc={pageData.toc} full={pageData.full}>
      <DocsTitle>{pageData.title}</DocsTitle>
      <DocsDescription>{pageData.description}</DocsDescription>
      <DocsBody>
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
        {/* Render validator diagram when validator_system and validator_id are provided */}
        <h2 className="text-2xl font-bold mb-4">Validator Endpoints</h2>
        <p>
          Click on a transaction link to view details about the redeemer and
          usage of this validator.
        </p>
        {pageData.validator_system && pageData.validator_id && (
          <>
            {Array.isArray(pageData.validator_id) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pageData.validator_id.map((validatorId) => (
                  <DiagramValidatorOverview
                    key={validatorId}
                    system={pageData.validator_system ?? ""}
                    validatorId={validatorId}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8">
                <DiagramValidatorOverview
                  system={pageData.validator_system}
                  validatorId={pageData.validator_id}
                />
              </div>
            )}
          </>
        )}
        {pageData.validator_system && !pageData.validator_id && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Validator Endpoints</h2>
            <p>
              Click on a transaction link to view details about the redeemer and
              usage of this validator.
            </p>
            <SystemDiagram system={pageData.validator_system} />
          </div>
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
