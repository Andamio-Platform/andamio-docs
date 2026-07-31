"use client";

import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";
import { Registry } from "@/types";
import { createTokenLink } from "../utils/tokenUtils";
import { resolveAddressDisplay } from "../utils/addressUtils";

interface OutputNodeData {
  id: string;
  address: string;
  datum?: string;
  script?: string;
  value: string[];
  type: string;
  registryData?: Registry | null;
  version?: string;
}

// Export the node type for use in the diagram component
export type { OutputNodeData };

function OutputNode({ data }: { data: OutputNodeData }) {
  const [showDetails, setShowDetails] = useState(false);

  const hasDetails = data.datum || data.script;

  const addressInfo = resolveAddressDisplay(data.address, data.registryData, data.version || "v2");


  return (
    <div className="shadow-md rounded-md border-2" style={{ backgroundColor: 'var(--diagram-output-bg)', borderColor: 'var(--diagram-output-border)', color: 'var(--diagram-output-text)' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="rounded-t-[calc(0.375rem-2px)] p-2" style={{ backgroundColor: 'var(--diagram-output-border)', color: 'var(--diagram-output-bg)' }}>
        <div className="text-sm">Output: {data.id}</div>
      </div>
      <div className="px-3 py-2 space-y-2 text-xs">
        <div className="flex">
          <span className="font-semibold mr-1">
            {data.type?.charAt(0).toUpperCase() + data.type?.slice(1)} Address:
          </span>
          {data.type === "script" && addressInfo.linkUrl ? (
            <Link
              href={addressInfo.linkUrl}
              className="text-[var(--diagram-output-text)] hover:opacity-70 transition-colors"
            >
              {addressInfo.displayName}
            </Link>
          ) : (
            <span>{addressInfo.displayName}</span>
          )}
        </div>

        <div>
          <span className="font-semibold">Value:</span>
          {Array.isArray(data.value)
            ? data.value.map((val, idx) => {
                const tokenInfo = createTokenLink(val, data.registryData, data.version || "v2");
                return (
                  <pre className="pt-1" key={idx}>
                    {tokenInfo.hasToken ? (
                      <>
                        {tokenInfo.amount}{" "}
                        <Link
                          href={tokenInfo.tokenLink ?? "#"}
                          className="text-[var(--diagram-output-text)] hover:opacity-70 transition-colors"
                        >
                          {tokenInfo.displayToken}
                        </Link>
                      </>
                    ) : (
                      val
                    )}
                  </pre>
                );
              })
            : (() => {
                const tokenInfo = createTokenLink(data.value as string, data.registryData, data.version || "v2");
                return (
                  <pre className="pt-1">
                    {tokenInfo.hasToken ? (
                      <>
                        {tokenInfo.amount}{" "}
                        <Link
                          href={tokenInfo.tokenLink ?? "#"}
                          className="text-[var(--diagram-output-text)] hover:opacity-70 transition-colors"
                        >
                          {tokenInfo.displayToken}
                        </Link>
                      </>
                    ) : (
                      data.value
                    )}
                  </pre>
                );
              })()}
        </div>
      </div>
      <div className="text-xs">
        {hasDetails && (
          <div className="px-0 pb-2 border-t border-[var(--diagram-output-border)] pt-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-green-600 hover:text-green-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-1 transition-transform ${showDetails ? "rotate-90" : ""}`}
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
              {showDetails ? "Hide" : "Show Datum"}
            </button>
          </div>
        )}

        {showDetails && (
          <div className="px-3 pb-2 pt-1 space-y-2 border-t border-[var(--diagram-output-border)]">
            {data.datum && (
              <div>
                <p className="font-semibold mb-1">Datum:</p>
                <pre className="bg-[var(--diagram-pre-bg)] p-2 rounded text-xs overflow-x-auto">
                  {typeof data.datum === "string"
                    ? (() => {
                        try {
                          const parsed = JSON.parse(data.datum);
                          return JSON.stringify(parsed, null, 2);
                        } catch {
                          return data.datum;
                        }
                      })()
                    : JSON.stringify(data.datum, null, 2)}
                </pre>
              </div>
            )}

            {data.script && (
              <div>
                <span className="font-semibold">Script:</span> {data.script}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(OutputNode);
