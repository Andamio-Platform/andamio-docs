"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

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
    redeemer?: string | object;
  }[];
  withdrawals?: {
    id: string;
    amount: number;
    redeemer?: string | object;
  }[];
}

export type { TransactionNodeData };

const TransactionNode = ({ data }: { data: TransactionNodeData }) => {
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
            <div className="font-semibold text-xs mb-1">Mints:</div>
            <div className="space-y-2">
              {data.mints.map((mint, index) => (
                <div
                  key={`mint-${mint.id}-${index}`}
                  className="bg-purple-100 border-2 border-purple-700 text-purple-700 bg-opacity-30 p-2 rounded text-xs"
                >
                  <div>
                    <span className="font-semibold">ID:</span> {mint.id}
                  </div>
                  {mint.tokens && mint.tokens.length > 0 && (
                    <div>
                      <span className="font-semibold">Tokens:</span>
                      <ul className="list-disc pl-5 space-y-1">
                        {mint.tokens.map((token, i) => (
                          <li key={`token-${i}`}>{token}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {mint.redeemer && (
                    <div>
                      <span className="font-semibold">Redeemer:</span>
                      <pre className="mt-1 bg-gray-900 text-purple-100 p-1 rounded overflow-x-auto text-xs">
                        {formatJSON(mint.redeemer)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Withdrawals section */}
        {data.withdrawals && data.withdrawals.length > 0 && (
          <div className="mt-2 border-t border-gray-600 pt-2">
            <div className="font-semibold text-xs mb-1">Withdrawals:</div>
            <div className="space-y-2">
              {data.withdrawals.map((withdrawal, index) => (
                <div
                  key={`withdrawal-${withdrawal.id}-${index}`}
                  className="bg-purple-100 border-2 border-purple-700 text-purple-700  bg-opacity-30 p-2 rounded text-xs"
                >
                  <div>
                    <span className="font-semibold">ID:</span> {withdrawal.id}
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span>{" "}
                    {withdrawal.amount}
                  </div>
                  {withdrawal.redeemer && (
                    <div>
                      <span className="font-semibold">Redeemer:</span>
                      <pre className="mt-1 bg-gray-900 text-purple-100 p-1 rounded overflow-x-auto text-xs">
                        {formatJSON(withdrawal.redeemer)}
                      </pre>
                    </div>
                  )}
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
