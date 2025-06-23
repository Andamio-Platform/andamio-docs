"use client";

import { memo, ReactNode } from "react";

interface GroupNodeData {
  label: string;
  children?: ReactNode;
}

export type { GroupNodeData };

function GroupNode({ data }: { data: GroupNodeData }) {
  return (
    <div className="px-4 py-4 shadow-md rounded-md bg-gray-700 bg-opacity-30 border border-gray-600 border-dashed min-w-[300px] min-h-[200px]">
      <div className="flex flex-col">
        <div className="flex items-center justify-center mb-2">
          <div className="font-bold text-sm text-gray-300">{data.label}</div>
        </div>
        {/* The children nodes will be positioned absolutely within the flow, 
            this is just a container with a background and border */}
      </div>
    </div>
  );
}

export default memo(GroupNode);
