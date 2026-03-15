"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";

interface ValidatorNodeData {
  name: string;
  purpose: string;
  system: string;
  id?: string; // Optional validator ID for reference
}

const ValidatorNode = ({ data }: { data: ValidatorNodeData }) => {
  // Generate validator documentation link
  const getValidatorLink = (system: string, validatorId?: string): string | null => {
    if (!validatorId) return null;
    
    // Check if it's an observer validator
    const isObserver = validatorId.includes('obs') || validatorId.includes('observer');
    
    if (isObserver) {
      return `/docs/protocol/v2/validators/${system}/observers/${validatorId}`;
    }
    
    return `/docs/protocol/v2/validators/${system}/${validatorId}`;
  };

  const validatorLink = getValidatorLink(data.system, data.id);

  return (
    <div className="px-4 py-4 shadow-md rounded-md bg-gray-100 border-2 border-blue-700 text-gray-700">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-center">
          {validatorLink ? (
            <Link 
              href={validatorLink}
              className="font-bold text-lg text-blue-700 hover:text-blue-900 hover:underline transition-colors"
            >
              {data.name}
            </Link>
          ) : (
            <div className="font-bold text-lg">{data.name}</div>
          )}
        </div>
        <div className="text-xs space-y-2">
          <div className="flex items-center">
            <span className="font-semibold mr-1">Purpose:</span> {data.purpose}
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-1">System:</span> 
            <Link 
              href={`/docs/protocol/v2/validators/${data.system}`}
              className="text-blue-700 hover:text-blue-900 hover:underline transition-colors"
            >
              {data.system}
            </Link>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default memo(ValidatorNode);
