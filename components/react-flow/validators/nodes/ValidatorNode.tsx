"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface ValidatorNodeData {
  name: string;
  purpose: string;
  system: string;
  id?: string; // Optional validator ID for reference
}

const ValidatorNode = ({ data }: { data: ValidatorNodeData }) => {
  return (
    <div className="px-4 py-4 shadow-md rounded-md bg-gray-100 border-2 border-blue-700 text-gray-700">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-center">
          <div className="font-bold text-lg">{data.name}</div>
        </div>
        <div className="text-xs space-y-2">
          <div className="flex items-center">
            <span className="font-semibold mr-1">Purpose:</span> {data.purpose}
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-1">System:</span> {data.system}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default memo(ValidatorNode);
