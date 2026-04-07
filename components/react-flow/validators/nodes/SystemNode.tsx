"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";

interface SystemNodeData {
  name: string;
  system: string;
}

const SystemNode = ({ data }: { data: SystemNodeData }) => {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-[var(--diagram-system-bg)] border-2 border-[var(--diagram-system-border)] text-[var(--diagram-system-text)]">
      <div className="flex items-center justify-center">
        <Link
          href={`/docs/protocol/v2/validators/${data.system}`}
          className="font-bold text-lg text-[var(--diagram-system-text)] hover:opacity-80 hover:underline transition-colors"
        >
          {data.name}
        </Link>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default memo(SystemNode);
