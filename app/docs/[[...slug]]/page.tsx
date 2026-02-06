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
import TxYamlMetadata from "@/components/protocol-info/TxYamlMetadata";
import TokenInfo from "@/components/protocol-info/TokenInfo";
import ValidatorInfo from "@/components/protocol-info/ValidatorInfo";
import ValidatorDiagram from "@/components/react-flow/validators/DiagramValidatorOverview";

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

  // Detect protocol version from URL
  const protocolVersion = params.slug?.includes("v2") ? "v2" : "v1";

  const docsWidth =
    pageData.tx_file ||
    pageData.validator_system ||
    params.slug?.join("/") === "protocol/v1/validators"
      ? ""
      : "w-2/3";

  // Helper function to get access level badge styles
  const getAccessLevelBadge = (level: string) => {
    const badges = {
      public: {
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        label: "Public",
      },
      private: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        label: "Private",
      },
      internal: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        label: "Internal",
      },
    };
    return badges[level as keyof typeof badges] || badges.public;
  };

  return (
    <DocsPage full={pageData.full}>
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
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <DocsBody className={docsWidth}>
        {pageData.tx_file && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-12">
            <div className="col-span-1 xl:col-span-4">
              <TransactionDiagramClient
                txFilePath={pageData.tx_file}
                version={protocolVersion}
              />
            </div>
            <div className="col-span-1 xl:col-span-1 w-full">
              <TxYamlMetadata
                txFilePath={pageData.tx_file}
                version={protocolVersion}
              />
            </div>
          </div>
        )}
        <MDXContent
          code={pageData.body}
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
        {(params.slug?.join("/").startsWith("protocol/v1/validators/") ||
          params.slug?.join("/").startsWith("protocol/v2/validators/")) &&
          params.slug.length >= 5 && (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-12">
              <div className="col-span-1 xl:col-span-4">
                <ValidatorDiagram
                  system={params.slug[3]}
                  validatorId={params.slug.length === 6 && params.slug[4] === "observers" ? params.slug[5] : params.slug[4]}
                  version={protocolVersion}
                />
              </div>
              <div className="col-span-1 xl:col-span-1 w-full">
                <ValidatorInfo
                  validatorSystem={params.slug[3]}
                  validatorId={params.slug.length === 6 && params.slug[4] === "observers" ? params.slug[5] : params.slug[4]}
                  version={protocolVersion}
                />
              </div>
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

        {(params.slug?.join("/").startsWith("protocol/v1/tokens/") ||
          params.slug?.join("/").startsWith("protocol/v2/tokens/")) &&
          params.slug.length >= 5 && (
            <TokenInfo
              tokenSystem={params.slug[3]}
              tokenId={params.slug[4]}
              version={protocolVersion}
            />
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
