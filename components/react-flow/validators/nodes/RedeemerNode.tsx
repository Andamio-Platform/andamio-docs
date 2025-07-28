"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";

interface RedeemerNodeData {
  type: string;
  action?: string;
  transaction: string | string[];
}

const roles = [
  "admin",
  "contributor",
  "course-creator",
  "project-creator",
  "student",
  "general", // Added general role for transactions like access-token-mint
];

const RedeemerNode = ({ data }: { data: RedeemerNodeData }) => {
  // Format transaction data for display
  const formatTransaction = (transaction: string | string[]) => {
    if (Array.isArray(transaction)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {transaction.map((tx, i) => (
            <li key={`tx-${i}`}>{tx}</li>
          ))}
        </ul>
      );
    }
    return transaction;
  };

  // Generate the appropriate link for a transaction using dot notation
  const getTransactionLink = (transaction: string): string => {
    // Handle dot notation format: "role.transaction-name"
    if (transaction.includes(".")) {
      const [role, txName] = transaction.split(".");
      return `/docs/protocol/v1/transactions/${role}/${txName}`;
    }

    // Fallback: Check if transaction starts with any of the roles (legacy format)
    for (const role of roles) {
      if (transaction.startsWith(`${role}-`)) {
        // Extract the transaction part after the role prefix
        const txPart = transaction.substring(role.length + 1); // +1 for the hyphen
        return `/docs/protocol/v1/transactions/${role}/${txPart}`;
      }
    }

    // Default case: assume it's a general transaction
    return `/docs/protocol/v1/transactions/general/${transaction}`;
  };

  return (
    <div className="px-4 py-4 shadow-md rounded-md bg-gray-100 border-2 border-green-700 text-gray-700">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <div className="font-bold">
            {data.action ? `Action: ${data.action}` : `Redeemer: ${data.type}`}
          </div>
        </div>
        <div className="text-xs space-y-2">
          {data.transaction && (
            <div>
              <span className="font-semibold mr-1">Transaction:</span>
              {typeof data.transaction === "string" ? (
                <Link
                  href={getTransactionLink(data.transaction)}
                  className="text-blue-700 hover:underline"
                >
                  {formatTransaction(data.transaction)}
                </Link>
              ) : (
                // For array of transactions, render each with its own link
                <ul className="list-disc pl-5 space-y-1">
                  {Array.isArray(data.transaction) &&
                    data.transaction.map((tx, i) => (
                      <li key={`tx-link-${i}`}>
                        <Link
                          href={getTransactionLink(tx)}
                          className="text-blue-700 hover:underline"
                        >
                          {tx}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(RedeemerNode);
