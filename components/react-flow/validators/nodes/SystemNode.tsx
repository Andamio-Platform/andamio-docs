"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface SystemNodeData {
  name: string;
}

const SystemNode = ({ data }: { data: SystemNodeData }) => {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-gray-100 border-2 border-purple-700 text-gray-700">
      <div className="flex items-center justify-center">
        <div className="font-bold text-lg">{data.name}</div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default memo(SystemNode);
