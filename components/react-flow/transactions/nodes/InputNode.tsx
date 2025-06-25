"use client";

import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";

interface InputNodeData {
  id: string;
  address: string;
  datum?: string;
  script?: string;
  tokens?: string[];
  value: string[];
  redeemer?: string;
  type?: string; // make sure to include type
}

// Export the node type for use in the diagram component
export type { InputNodeData };

function InputNode({ data }: { data: InputNodeData }) {
  const [showDetails, setShowDetails] = useState(false);

  const hasDetails = data.redeemer || data.datum || data.script;

  const hasValidator = data.address.includes('.');
  const linkUrl = hasValidator
    ? `/docs/protocol/v1/validators/${data.address.split('.')[0]}/${data.address.split('.')[1]}`
    : null;

  return (
    <div className="shadow-md rounded-md bg-blue-100 border-2 border-blue-700 text-blue-700">
      <div className="bg-blue-700 text-blue-100 rounded-t-[calc(0.375rem-2px)] p-2">
        <div className="text-sm">Input: {data.id}</div>
      </div>
      <div className="px-3 py-2 space-y-2 text-xs">
        <div className="flex">
          <span className="font-semibold mr-1">{data.type && data.type?.charAt(0).toUpperCase() + data.type?.slice(1)}{" "}Address:</span>
          {data.type === "script" && linkUrl ? (
            <Link
              href={linkUrl}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {data.address.split('.')[1]}
            </Link>
          ) : (
            <span>{data.address}</span>
          )}
        </div>

        <div>
          <span className="font-semibold">Value:</span>
          {Array.isArray(data.value) ? (
            data.value.map((val, idx) => <pre className="pt-1" key={idx}>{val}</pre>)
          ) : (
            <pre className="pt-1">{data.value}</pre>
          )}
        </div>

      </div>
      <div className="text-xs">
        {hasDetails && (
          <div className="px-0 pb-2 border-t border-blue-500 pt-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
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
              {showDetails ? "Hide" : "Show Datum and Redeemer"}
            </button>
          </div>
        )}

        {showDetails && (
          <div className="px-3 pb-2 pt-1 space-y-2 border-t border-blue-300">
            {data.redeemer && (
              <div>
                <p className="font-semibold mb-1">Redeemer:</p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {typeof data.redeemer === "string"
                    ? (() => {
                      try {
                        const parsed = JSON.parse(data.redeemer);
                        return JSON.stringify(parsed, null, 2);
                      } catch {
                        return data.redeemer;
                      }
                    })()
                    : JSON.stringify(data.redeemer, null, 2)}
                </pre>
              </div>
            )}

            {data.datum && (
              <div>
                <p className="font-semibold mb-1">Datum:</p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
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
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}

export default memo(InputNode);
