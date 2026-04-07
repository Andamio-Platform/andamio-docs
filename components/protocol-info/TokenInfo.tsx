"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import yaml from "js-yaml";
import { DeploymentParams } from "@/types";

interface TokenInfoProps {
  tokenSystem: string;
  tokenId: string;
  version?: string;
}

interface TokenData {
  "asset-id": string;
  "minted-in"?: string | string[] | null;
  "used-in"?: string | string[] | null;
  "referenced-in"?: string | string[] | null;
  "burned-in"?: string | string[] | null;
}

interface Registry {
  systems: {
    [key: string]: {
      tokens?: {
        [key: string]: TokenData;
      };
    };
  };
}

export default function TokenInfo({ tokenSystem, tokenId, version = "v1" }: TokenInfoProps) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [mainnetParams, setMainnetParams] = useState<DeploymentParams | null>(
    null
  );
  const [preprodParams, setPreprodParams] = useState<DeploymentParams | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch registry data
        const registryResponse = await fetch(
          `/yaml/validator-registry-${version}.yaml`
        );
        const registryText = await registryResponse.text();
        const registry = yaml.load(registryText) as Registry;

        // Find token data
        const systemData = registry.systems[tokenSystem];
        if (!systemData?.tokens || !systemData.tokens[tokenId]) {
          throw new Error(
            `Token ${tokenSystem}.${tokenId} not found in registry`
          );
        }

        setTokenData(systemData.tokens[tokenId]);

        // Fetch deployment params
        const [mainnetResponse, preprodResponse] = await Promise.all([
          fetch(`/yaml/deployments/mainnet-${version}/params.yaml`),
          fetch(`/yaml/deployments/preprod-${version}/params.yaml`),
        ]);

        const mainnetText = await mainnetResponse.text();
        const preprodText = await preprodResponse.text();

        setMainnetParams(yaml.load(mainnetText) as DeploymentParams);
        setPreprodParams(yaml.load(preprodText) as DeploymentParams);

        setError(null);
      } catch (err) {
        console.error("Error fetching token info:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tokenSystem, tokenId, version]);

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

  if (error || !tokenData) {
    return null; // Fail silently
  }

  // Helper function to normalize transaction names to arrays
  const normalizeToArray = (
    value: string | string[] | null | undefined
  ): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  // Helper function to format transaction link
  const getTransactionLink = (txName: string): string => {
    // Handle dot notation: role.transaction-name
    if (txName.includes(".")) {
      const [role, transactionName] = txName.split(".");
      const roleMap: { [key: string]: string } = {
        admin: "admin",
        contributor: "contributor",
        "course-creator": "course-creator",
        "project-creator": "project-creator",
        student: "student",
        general: "general",
      };

      const mappedRole = roleMap[role] || role;
      return `/docs/protocol/${version}/transactions/${mappedRole}/${transactionName}`;
    }

    // Fallback for legacy format (e.g., "access-token-mint" without dot notation)
    return `/docs/protocol/${version}/transactions/general/${txName}`;
  };

  // Helper function to resolve placeholders in asset ID
  const resolveAssetId = (
    assetId: string,
    params: DeploymentParams | null
  ): string => {
    if (!params) return assetId;

    let resolved = assetId;
    const placeholderRegex = /<([^>]+)>/g;
    let match;

    while ((match = placeholderRegex.exec(assetId)) !== null) {
      const placeholder = match[1];

      // Look for the value in the deployment params
      for (const system of Object.values(params.systems)) {
        if (system.tokens && system.tokens[placeholder]) {
          resolved = resolved.replace(
            `<${placeholder}>`,
            system.tokens[placeholder]
          );
        }
      }
    }

    return resolved;
  };

  // Helper function to extract policy ID from resolved asset ID
  const extractPolicyId = (resolvedAssetId: string): string | null => {
    // Check if it contains a hex policy ID (64 characters before the dot)
    const policyMatch = resolvedAssetId.match(/^([a-f0-9]{56,64})\./);
    return policyMatch ? policyMatch[1] : null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Asset ID Section */}
      <div className="bg-muted/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Asset ID Pattern
          </div>
        </div>
        <code className="text-sm font-mono text-foreground/90">
          {tokenData["asset-id"]}
        </code>
      </div>

      {/* Usage Section */}
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <div className="bg-muted/20 px-4 py-2 border-b border-border/50">
          <div className="text-sm font-medium">Usage</div>
        </div>

        <div className="px-4 py-3 space-y-4">
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-1.5">
              Minted In
            </div>
            {normalizeToArray(tokenData["minted-in"]).length > 0 ? (
              <ul className="space-y-0.5 ml-4">
                {normalizeToArray(tokenData["minted-in"]).map((tx, index) => (
                  <li key={index} className="list-disc text-xs">
                    <Link
                      href={getTransactionLink(tx)}
                      className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                    >
                      {tx}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground ml-4">None</p>
            )}
          </div>

          <div>
            <div className="text-xs text-muted-foreground font-medium mb-1.5">
              Used In
            </div>
            {normalizeToArray(tokenData["used-in"]).length > 0 ? (
              <ul className="space-y-0.5 ml-4">
                {normalizeToArray(tokenData["used-in"]).map((tx, index) => (
                  <li key={index} className="list-disc text-xs">
                    <Link
                      href={getTransactionLink(tx)}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {tx}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground ml-4">None</p>
            )}
          </div>

          <div>
            <div className="text-xs text-muted-foreground font-medium mb-1.5">
              Referenced In
            </div>
            {normalizeToArray(tokenData["referenced-in"]).length > 0 ? (
              <ul className="space-y-0.5 ml-4">
                {normalizeToArray(tokenData["referenced-in"]).map(
                  (tx, index) => (
                    <li key={index} className="list-disc text-xs">
                      <Link
                        href={getTransactionLink(tx)}
                        className="text-violet-700 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 transition-colors"
                      >
                        {tx}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground ml-4">None</p>
            )}
          </div>

          <div>
            <div className="text-xs text-muted-foreground font-medium mb-1.5">
              Burned In
            </div>
            {normalizeToArray(tokenData["burned-in"]).length > 0 ? (
              <ul className="space-y-0.5 ml-4">
                {normalizeToArray(tokenData["burned-in"]).map((tx, index) => (
                  <li key={index} className="list-disc text-xs">
                    <Link
                      href={getTransactionLink(tx)}
                      className="text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                    >
                      {tx}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground ml-4">None</p>
            )}
          </div>
        </div>
      </div>

      {/* Deployments Section */}
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <div className="bg-muted/20 px-4 py-2 border-b border-border/50">
          <div className="text-sm font-medium">Deployments</div>
        </div>

        <div className="divide-y divide-border/50">
          <div className="px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground font-medium min-w-[80px]">
                Mainnet {version}
              </div>
              <div className="flex-1">
                {mainnetParams ? (
                  (() => {
                    const resolved = resolveAssetId(
                      tokenData["asset-id"],
                      mainnetParams
                    );
                    const policyId = extractPolicyId(resolved);

                    if (policyId) {
                      return (
                        <code className="text-xs font-mono text-foreground/80 break-all">
                          <Link
                            href={`https://cardanoscan.io/tokenPolicy/${policyId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {policyId}
                          </Link>
                          {resolved.substring(policyId.length)}
                        </code>
                      );
                    }
                    return (
                      <code className="text-xs font-mono text-foreground/80 break-all">
                        {resolved}
                      </code>
                    );
                  })()
                ) : (
                  <span className="text-xs text-muted-foreground">n/a</span>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground font-medium min-w-[80px]">
                Preprod {version}
              </div>
              <div className="flex-1">
                {preprodParams ? (
                  (() => {
                    const resolved = resolveAssetId(
                      tokenData["asset-id"],
                      preprodParams
                    );
                    const policyId = extractPolicyId(resolved);

                    if (policyId) {
                      return (
                        <code className="text-xs font-mono text-foreground/80 break-all">
                          <Link
                            href={`https://preprod.cardanoscan.io/tokenPolicy/${policyId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {policyId}
                          </Link>
                          {resolved.substring(policyId.length)}
                        </code>
                      );
                    }
                    return (
                      <code className="text-xs font-mono text-foreground/80 break-all">
                        {resolved}
                      </code>
                    );
                  })()
                ) : (
                  <span className="text-xs text-muted-foreground">n/a</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
