"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TransactionYaml } from "@/types";

interface TxYamlMetadataProps {
  txFilePath: string;
  version?: string;
}

interface ExtendedMetadata {
  role: string;
  category: string;
  requires_tokens: string[];
  estimated_fee?: string;
  estimated_cost?: string;
  description: string;
  multi_signature: boolean;
  required_signatures?: string[];
}

export default function TxYamlMetadata({
  txFilePath,
  version = "v1",
}: TxYamlMetadataProps) {
  const [txData, setTxData] = useState<TransactionYaml | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);

        // Use V2 API for v2 transactions, V1 API otherwise
        const apiEndpoint = version === "v2"
          ? `/api/transaction-v2?file=${encodeURIComponent(txFilePath)}&format=v1`
          : `/api/transaction?file=${encodeURIComponent(txFilePath)}&version=${version}`;

        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch transaction data: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("TxYamlMetadata received data:", data);
        // V2 API with format=v1 returns diagramData, V1 API returns data
        const txDataResult = version === "v2" ? data.diagramData : (data.data || data);
        setTxData(txDataResult);
        setError(null);
      } catch (err) {
        console.error("Error fetching transaction metadata:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [txFilePath, version]);

  if (loading) {
    return (
      <div className="w-full rounded-lg border p-6 bg-muted/20">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !txData) {
    console.warn("TxYamlMetadata: No data available", { error, txData });
    return null; // Fail silently to not disrupt the page
  }

  if (!txData.metadata) {
    console.warn("TxYamlMetadata: No metadata in transaction data", txData);
    return null;
  }

  const metadata = txData.metadata as ExtendedMetadata;

  // Helper function to get token documentation link
  const getTokenLink = (tokenName: string): string => {
    // Handle dot notation: system.token-name
    if (tokenName.includes(".")) {
      const [system, token] = tokenName.split(".");
      return `/docs/protocol/${version}/tokens/${system}/${token}`;
    }

    // Fallback for tokens without dot notation
    return `/docs/protocol/${version}/tokens/global-state/${tokenName}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Overview Section */}
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <div className="bg-muted/20 px-4 py-2 border-b border-border/50">
          <div className="text-sm font-medium">Overview</div>
        </div>

        <div className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-xs text-muted-foreground font-medium mb-1">
                Role
              </div>
              <div className="text-sm font-medium">
                {metadata.role || "Unknown"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-medium mb-1">
                Category
              </div>
              <div className="text-sm font-medium">
                {metadata.category || "Unknown"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-medium mb-1">
                Estimated Cost
              </div>
              <div className="text-sm font-medium">
                {metadata.estimated_fee || metadata.estimated_cost || "0 ADA"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-medium mb-1">
                Multi-signature
              </div>
              <div className="text-sm font-medium">
                {metadata.multi_signature ? "Yes" : "No"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground font-medium mb-1">
              Description
            </div>
            <div className="text-sm">
              {metadata.description || "No description available"}
            </div>
          </div>
        </div>
      </div>

      {/* Required Tokens Section */}
      {metadata.requires_tokens && metadata.requires_tokens.length > 0 && (
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <div className="bg-muted/20 px-4 py-2 border-b border-border/50">
            <div className="text-sm font-medium">Required Tokens</div>
          </div>

          <div className="px-4 py-3">
            <ul className="space-y-0.5 ml-4">
              {metadata.requires_tokens.map((token, index) => (
                <li key={index} className="list-disc text-xs">
                  <Link
                    href={getTokenLink(token)}
                    className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    {token}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Required Signatures Section */}
      {metadata.required_signatures &&
        metadata.required_signatures.length > 0 && (
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <div className="bg-muted/20 px-4 py-2 border-b border-border/50">
              <div className="text-sm font-medium">Required Signatures</div>
            </div>

            <div className="px-4 py-3">
              <ul className="space-y-0.5 ml-4">
                {metadata.required_signatures.map((sig, index) => (
                  <li key={index} className="list-disc text-xs">
                    <span className="text-violet-700 dark:text-violet-400">
                      {sig}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
    </div>
  );
}
