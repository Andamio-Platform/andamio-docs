"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import yaml from "js-yaml";
import { RedeemerType } from "@/types";

interface ValidatorInfoProps {
  validatorSystem: string;
  validatorId: string;
  version?: string;
}

interface ValidatorData {
  name: string;
  purpose: string | string[];
  address?: string;
  policy?: string;
  redeemer?: RedeemerType;
}

interface Registry {
  systems: {
    [key: string]: {
      validators?: {
        [key: string]: ValidatorData;
      };
    };
  };
}

interface DeploymentParams {
  deployment: string;
  version: string;
  systems: {
    [key: string]: {
      addresses?: {
        [key: string]: string;
      };
      tokens?: {
        [key: string]: string;
      };
    };
  };
}

export default function ValidatorInfo({
  validatorSystem,
  validatorId,
  version = "v1",
}: ValidatorInfoProps) {
  const [validatorData, setValidatorData] = useState<ValidatorData | null>(
    null
  );
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

        // Find validator data
        const systemData = registry.systems[validatorSystem];
        if (!systemData?.validators || !systemData.validators[validatorId]) {
          throw new Error(
            `Validator ${validatorSystem}.${validatorId} not found in registry`
          );
        }

        setValidatorData(systemData.validators[validatorId]);

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
        console.error("Error fetching validator info:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [validatorSystem, validatorId, version]);

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

  if (error || !validatorData) {
    return null; // Fail silently
  }

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

    // Fallback for legacy format
    return `/docs/protocol/${version}/transactions/general/${txName}`;
  };

  // Helper function to resolve placeholders
  const resolvePlaceholder = (
    placeholder: string,
    params: DeploymentParams | null
  ): string => {
    if (!params) return placeholder;

    const cleanPlaceholder = placeholder.replace(/[<>]/g, "");

    // Look in all systems for the placeholder
    for (const system of Object.values(params.systems)) {
      if (system.addresses && system.addresses[cleanPlaceholder]) {
        return system.addresses[cleanPlaceholder];
      }
      if (system.tokens && system.tokens[cleanPlaceholder]) {
        return system.tokens[cleanPlaceholder];
      }
    }

    return placeholder;
  };

  // Helper function to extract policy ID from resolved value
  const extractPolicyId = (resolved: string): string | null => {
    // Check if it's a hex policy ID (56-64 characters, all hex)
    const policyMatch = resolved.match(/^([a-f0-9]{56,64})$/);
    return policyMatch ? policyMatch[1] : null;
  };

  // Helper function to check if a string is a Cardano address
  const isCardanoAddress = (value: string): boolean => {
    // Cardano addresses start with addr1 (mainnet) or addr_test1 (testnet)
    return value.startsWith("addr1") || value.startsWith("addr_test1");
  };

  // Helper function to extract redeemer info for display
  const extractRedeemerInfo = (
    redeemer: RedeemerType | undefined
  ): Array<{
    type: string;
    actions: Array<{ name: string; transactions: string[] }>;
    transactions: string[];
  }> => {
    if (!redeemer) return [];

    const redeemerList: Array<{
      type: string;
      actions: Array<{ name: string; transactions: string[] }>;
      transactions: string[];
    }> = [];

    const processRedeemer = (redeemerItem: unknown): void => {
      if (!redeemerItem || typeof redeemerItem !== "object") return;

      const item = redeemerItem as Record<string, unknown>;
      const type = typeof item.type === "string" ? item.type : "unknown";
      const transactions: string[] = [];
      const actions: Array<{ name: string; transactions: string[] }> = [];

      // Extract direct transactions
      if (item.transaction) {
        if (Array.isArray(item.transaction)) {
          transactions.push(
            ...item.transaction.filter((tx: unknown) => typeof tx === "string")
          );
        } else if (typeof item.transaction === "string") {
          transactions.push(item.transaction);
        }
      }

      // Extract actions and their transactions
      Object.keys(item).forEach((key) => {
        if (key !== "type" && key !== "transaction") {
          const actionGroup = item[key];
          if (Array.isArray(actionGroup)) {
            actionGroup.forEach((actionItem: unknown) => {
              if (typeof actionItem === "object" && actionItem !== null) {
                const action = actionItem as Record<string, unknown>;
                if (typeof action.action === "string") {
                  const actionTransactions: string[] = [];
                  if (action.transaction) {
                    if (Array.isArray(action.transaction)) {
                      actionTransactions.push(
                        ...action.transaction.filter(
                          (tx: unknown) => typeof tx === "string"
                        )
                      );
                    } else if (typeof action.transaction === "string") {
                      actionTransactions.push(action.transaction);
                    }
                  }
                  actions.push({
                    name: action.action,
                    transactions: actionTransactions,
                  });
                }
              }
            });
          }
        }
      });

      redeemerList.push({ type, actions, transactions });
    };

    if (Array.isArray(redeemer)) {
      redeemer.forEach(processRedeemer);
    } else {
      processRedeemer(redeemer);
    }

    return redeemerList;
  };

  // Extract all transactions that invoke this validator
  const redeemerInfo = extractRedeemerInfo(validatorData.redeemer);

  return (
    <div className="w-full space-y-4">
      {/* Validator Purpose Section */}
      <div className="bg-muted/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Purpose
          </div>
        </div>
        <div className="text-base text-foreground/90">
          {Array.isArray(validatorData.purpose)
            ? validatorData.purpose.join(", ")
            : validatorData.purpose}
        </div>
      </div>

      {/* Redeemers Section */}
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <div className="bg-muted/20 px-4 py-2 border-b border-border/50">
          <div className="text-sm font-medium">Redeemers</div>
        </div>

        <div className="px-4 py-3 space-y-4">
          {redeemerInfo.length > 0 ? (
            redeemerInfo.map((redeemer, redeemerIndex) => (
              <div key={redeemerIndex}>
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  Type: {redeemer.type}
                </div>

                {/* Direct transactions */}
                {redeemer.transactions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm text-muted-foreground mb-1 ml-2">
                      Direct transactions:
                    </div>
                    <ul className="space-y-0.5 ml-6">
                      {redeemer.transactions.map((tx, txIndex) => (
                        <li key={txIndex} className="list-disc text-sm">
                          <Link
                            href={getTransactionLink(tx)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {tx}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {redeemer.actions.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 ml-2">
                      Actions:
                    </div>
                    <div className="ml-4 space-y-2">
                      {redeemer.actions.map((action, actionIndex) => (
                        <div key={actionIndex}>
                          <div className="text-sm font-medium text-foreground/80">
                            {action.name}
                          </div>
                          {action.transactions.length > 0 ? (
                            <ul className="space-y-0.5 ml-4 mt-1">
                              {action.transactions.map((tx, txIndex) => (
                                <li key={txIndex} className="list-disc text-sm">
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
                            <div className="text-sm text-muted-foreground ml-4 mt-1">
                              No transactions documented
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show if completely empty */}
                {redeemer.transactions.length === 0 &&
                  redeemer.actions.length === 0 && (
                    <div className="text-sm text-muted-foreground ml-4">
                      No transactions or actions documented
                    </div>
                  )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No redeemers defined
            </p>
          )}
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
              <div className="flex-1 space-y-2">
                {validatorData.address && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Address:
                    </div>
                    {mainnetParams ? (
                      (() => {
                        const resolved = resolvePlaceholder(
                          validatorData.address,
                          mainnetParams
                        );

                        if (isCardanoAddress(resolved)) {
                          return (
                            <code className="text-sm font-mono text-foreground/80 break-all">
                              <Link
                                href={`https://cardanoscan.io/address/${resolved}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                {resolved}
                              </Link>
                            </code>
                          );
                        }
                        return (
                          <code className="text-sm font-mono text-foreground/80 break-all">
                            {resolved}
                          </code>
                        );
                      })()
                    ) : (
                      <code className="text-sm font-mono text-foreground/80 break-all">
                        {validatorData.address}
                      </code>
                    )}
                  </div>
                )}
                {validatorData.policy && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Policy:
                    </div>
                    {mainnetParams ? (
                      (() => {
                        const resolved = resolvePlaceholder(
                          validatorData.policy,
                          mainnetParams
                        );
                        const policyId = extractPolicyId(resolved);

                        if (policyId) {
                          return (
                            <code className="text-sm font-mono text-foreground/80 break-all">
                              <Link
                                href={`https://cardanoscan.io/tokenPolicy/${policyId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                {policyId}
                              </Link>
                            </code>
                          );
                        }
                        return (
                          <code className="text-sm font-mono text-foreground/80 break-all">
                            {resolved}
                          </code>
                        );
                      })()
                    ) : (
                      <code className="text-sm font-mono text-foreground/80 break-all">
                        {validatorData.policy}
                      </code>
                    )}
                  </div>
                )}
                {!validatorData.address && !validatorData.policy && (
                  <span className="text-sm text-muted-foreground">n/a</span>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground font-medium min-w-[80px]">
                Preprod {version}
              </div>
              <div className="flex-1 space-y-2">
                {validatorData.address && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Address:
                    </div>
                    {preprodParams ? (
                      (() => {
                        const resolved = resolvePlaceholder(
                          validatorData.address,
                          preprodParams
                        );

                        if (isCardanoAddress(resolved)) {
                          return (
                            <code className="text-sm font-mono text-foreground/80 break-all">
                              <Link
                                href={`https://preprod.cardanoscan.io/address/${resolved}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                {resolved}
                              </Link>
                            </code>
                          );
                        }
                        return (
                          <code className="text-sm font-mono text-foreground/80 break-all">
                            {resolved}
                          </code>
                        );
                      })()
                    ) : (
                      <code className="text-sm font-mono text-foreground/80 break-all">
                        {validatorData.address}
                      </code>
                    )}
                  </div>
                )}
                {validatorData.policy && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Policy:
                    </div>
                    {preprodParams ? (
                      (() => {
                        const resolved = resolvePlaceholder(
                          validatorData.policy,
                          preprodParams
                        );
                        const policyId = extractPolicyId(resolved);

                        if (policyId) {
                          return (
                            <code className="text-sm font-mono text-foreground/80 break-all">
                              <Link
                                href={`https://preprod.cardanoscan.io/tokenPolicy/${policyId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                {policyId}
                              </Link>
                            </code>
                          );
                        }
                        return (
                          <code className="text-sm font-mono text-foreground/80 break-all">
                            {resolved}
                          </code>
                        );
                      })()
                    ) : (
                      <code className="text-sm font-mono text-foreground/80 break-all">
                        {validatorData.policy}
                      </code>
                    )}
                  </div>
                )}
                {!validatorData.address && !validatorData.policy && (
                  <span className="text-sm text-muted-foreground">n/a</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
