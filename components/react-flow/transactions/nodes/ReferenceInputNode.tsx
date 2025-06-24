"use client";

import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";

interface ReferenceInputNodeData {
  id: string;
  address: string;
  datum?: string;
  script?: string;
  value: string[];
  type?: string;
}

// Export the node type for use in the diagram component
export type { ReferenceInputNodeData };

function ReferenceInputNode({ data }: { data: ReferenceInputNodeData }) {
  const [showDetails, setShowDetails] = useState(false);

  const hasDetails = data.datum || data.script;

  return (
    <div className="py-2 shadow-md rounded-md bg-orange-100 border-2 border-orange-700 text-orange-700">
      <div className="flex flex-col space-y-3 text-xs">
        <div className="flex flex-col px-2 space-y-1">
          <div className="font-bold">Ref Input: {data.id}</div>
          <div className="flex">
            <span className="font-semibold mr-1">Address:</span>{" "}
            {data.type === "script" ? (
              <Link
                href={data.address}
                className="text-orange-600 hover:text-orange-800 transition-colors"
              >
                {data.address}
              </Link>
            ) : (
              <span className="text-xs">{data.address}</span>
            )}
          </div>
          <div>
            <span className="font-semibold mr-1">Type:</span>{" "}
            <span className="text-xs">{data.type || "pubkey"}</span>
          </div>
          <div>
            <p className="font-semibold mr-1">Value:</p>
            <ul className="list-disc pl-4 text-xs">
              {Array.isArray(data.value) ? (
                data.value.map((val, idx) => <li key={idx}>{val}</li>)
              ) : (
                <li>{data.value}</li>
              )}
            </ul>
          </div>
        </div>

        {hasDetails && (
          <div className="text-xs px-1">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-orange-600 hover:text-orange-800 transition-colors"
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
              {showDetails ? "Hide" : "Show Datum and Script"}
            </button>
          </div>
        )}

        {showDetails && (
          <>
            {data.datum && (
              <div className="text-xs px-4">
                <p className="font-semibold">Datum:</p>
                <pre className="bg-gray-100 p-1 rounded text-xs">
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
              <div className="text-xs px-4 flex items-center">
                <span className="font-semibold mr-1">Script:</span>{" "}
                {data.script}
              </div>
            )}
          </>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}

export default memo(ReferenceInputNode);
