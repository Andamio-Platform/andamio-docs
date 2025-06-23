"use client";

import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";

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

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-blue-700 text-blue-700">
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col">
          <div className="font-bold">Input: {data.id}</div>
          <div className="flex">
            <span className="font-semibold mr-1">Address:</span> {data.address}
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
          <div className="text-xs">
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
              {showDetails ? "Hide details" : "Show details"}
            </button>
          </div>
        )}

        {showDetails && (
          <>
            {data.redeemer && (
              <div className="text-xs">
                <p className="font-semibold">Redeemer:</p>
                <pre className="bg-gray-100 p-1 rounded text-xs">
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
              <div className="text-xs">
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
              <div className="text-xs flex items-center">
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

export default memo(InputNode);
