"use client";

import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";

interface TransactionNodeData {
  name: string;
  description: string;
  fee: number;
  validity: string;
  type?: string;
  role?: string;
  mints?: {
    id: string;
    tokens: string[];
    policy: string;
    redeemer?: string | object;
  }[];
  withdrawals?: {
    id: string;
    amount: number;
    observer?: string;
    redeemer?: string | object;
  }[];
}

export type { TransactionNodeData };

const TransactionNode = ({ data }: { data: TransactionNodeData }) => {
  // State for toggling mint and withdrawal details
  const [showMintDetails, setShowMintDetails] = useState(false);
  const [showWithdrawalDetails, setShowWithdrawalDetails] = useState(false);

  console.log("txnode", data);

  // Helper function to format JSON data
  const formatJSON = (data: unknown) => {
    if (!data) return "";
    try {
      if (typeof data === "string") {
        return JSON.stringify(JSON.parse(data), null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch {
      // If parsing fails, return as string
      return String(data);
    }
  };

  return (
    <div className="px-4 py-4 shadow-md rounded-md bg-gray-100 border border-gray-700 text-gray-700">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-center">
          <div className="font-bold text-lg">{data.name}</div>
        </div>
        <div className="text-xs">
          <div className="flex items-center">
            <span className="font-semibold mr-1">Type:</span> {data.type}
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-1">Role:</span> {data.role}
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-1">Fee:</span> {data.fee}
          </div>
        </div>

        {/* Mints section */}
        {data.mints && data.mints.length > 0 && (
          <div className="mt-2 border-t border-gray-600 pt-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-xs">
                Mints ({data.mints.length}):
              </div>
              <button
                onClick={() => setShowMintDetails(!showMintDetails)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 mr-1 transition-transform ${showMintDetails ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                {showMintDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>

            <div className="space-y-2 mt-1">
              {data.mints.map((mint, index) => (
                <div
                  key={`mint-${mint.id}-${index}`}
                  className="shadow-md rounded-md bg-purple-100 border-2 border-purple-700 text-purple-700"
                >
                  <div className="bg-purple-700 text-purple-100 rounded-t-[calc(0.375rem-2px)] p-2">
                    <div className="text-sm">Mint: {mint.id}</div>
                  </div>
                  <div className="px-3 py-2 space-y-2 text-xs">
                    <div className="flex">
                      <span className="font-semibold mr-1">Policy:</span>
                      {(() => {
                        const hasValidator =
                          mint.policy && mint.policy.includes(".");
                        const linkUrl = hasValidator
                          ? (() => {
                              const parts = mint.policy.split(".");
                              const validatorName = parts[1];
                              const isObserver = validatorName.includes("obs");
                              return isObserver
                                ? `/docs/protocol/v1/validators/${parts[0]}/observer/${validatorName}`
                                : `/docs/protocol/v1/validators/${parts[0]}/${validatorName}`;
                            })()
                          : null;

                        return hasValidator && linkUrl ? (
                          <Link
                            href={linkUrl}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            {mint.policy.split(".")[1]}
                          </Link>
                        ) : (
                          <span>{mint.policy || "N/A"}</span>
                        );
                      })()}
                    </div>

                    {showMintDetails && (
                      <div className="space-y-2">
                        {mint.tokens && mint.tokens.length > 0 && (
                          <div>
                            <span className="font-semibold">Tokens:</span>
                            {mint.tokens.map((token, i) => (
                              <pre className="pt-1" key={`token-${i}`}>
                                {token}
                              </pre>
                            ))}
                          </div>
                        )}
                        {mint.redeemer && (
                          <div>
                            <p className="font-semibold mb-1">Redeemer:</p>
                            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                              {formatJSON(mint.redeemer)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Withdrawals section */}
        {data.withdrawals && data.withdrawals.length > 0 && (
          <div className="mt-2 border-t border-gray-600 pt-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-xs">
                Withdrawals ({data.withdrawals.length}):
              </div>
              <button
                onClick={() => setShowWithdrawalDetails(!showWithdrawalDetails)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 mr-1 transition-transform ${showWithdrawalDetails ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                {showWithdrawalDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>

            <div className="space-y-2 mt-1">
              {data.withdrawals.map((withdrawal, index) => (
                <div
                  key={`withdrawal-${withdrawal.id}-${index}`}
                  className="shadow-md rounded-md bg-cyan-100 border-2 border-cyan-700 text-cyan-700"
                >
                  <div className="bg-cyan-700 text-cyan-100 rounded-t-[calc(0.375rem-2px)] p-2">
                    <div className="text-sm">Withdrawal: {withdrawal.id}</div>
                  </div>
                  <div className="px-3 py-2 space-y-2 text-xs">
                    <div className="flex">
                      <span className="font-semibold mr-1">Amount:</span>
                      <span>{withdrawal.amount}</span>
                    </div>

                    {withdrawal.observer && (
                      <div className="flex">
                        <span className="font-semibold mr-1">Observer:</span>
                        {(() => {
                          const hasObserver =
                            withdrawal.observer &&
                            withdrawal.observer.includes(".");
                          const linkUrl = hasObserver
                            ? (() => {
                                const parts = withdrawal.observer.split(".");
                                const observerName = parts[1];
                                return `/docs/protocol/v1/validators/${parts[0]}/observers/${observerName}`;
                              })()
                            : null;

                          console.log("hasObserver", hasObserver);
                          console.log("linkUrl", linkUrl);

                          return hasObserver && linkUrl ? (
                            <Link
                              href={linkUrl}
                              className="text-cyan-600 hover:text-cyan-800 transition-colors"
                            >
                              {withdrawal.observer.split(".")[1]}
                            </Link>
                          ) : (
                            <span>{withdrawal.observer || "N/A"}</span>
                          );
                        })()}
                      </div>
                    )}

                    {showWithdrawalDetails && withdrawal.redeemer && (
                      <div>
                        <p className="font-semibold mb-1">Redeemer:</p>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                          {formatJSON(withdrawal.redeemer)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default memo(TransactionNode);
