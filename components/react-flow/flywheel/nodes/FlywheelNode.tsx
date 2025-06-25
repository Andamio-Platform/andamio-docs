"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

export interface FlywheelNodeData {
  label: string;
  description: string;
  problem: string;
  problemDescription: string;
  nodeType: "problem" | "step";
  handles?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

const FlywheelNode = ({ data }: { data: FlywheelNodeData }) => {
  const handles = data.handles || {
    top: true,
    right: true,
    bottom: true,
    left: true,
  };

  // Different styles for problems vs steps
  const getNodeStyle = () => {
    if (data.nodeType === "problem") {
      return "bg-red-50 border-red-400 text-red-900 shadow-lg";
    } else {
      return "bg-blue-50 border-blue-400 text-blue-900 shadow-lg";
    }
  };

  return (
    <div className={`px-4 py-3 rounded-lg border-2 relative max-w-[260px] ${getNodeStyle()}`}>
      {/* Handles */}
      {handles.top && (
        <>
          <Handle
            id="top"
            type="source"
            position={Position.Top}
            className="w-4 h-4 border-2 border-gray-600"
          />
          <Handle
            id="top-target"
            type="target"
            position={Position.Top}
            className="w-4 h-4 border-2 border-gray-600"
            style={{ opacity: 0 }}
          />
        </>
      )}
      {handles.bottom && (
        <>
          <Handle
            id="bottom"
            type="source"
            position={Position.Bottom}
            className="w-4 h-4 border-2 border-gray-600"
          />
          <Handle
            id="bottom-target"
            type="target"
            position={Position.Bottom}
            className="w-4 h-4 border-2 border-gray-600"
            style={{ opacity: 0 }}
          />
        </>
      )}
      {handles.left && (
        <>
          <Handle
            id="left"
            type="source"
            position={Position.Left}
            className="w-4 h-4 border-2 border-gray-600"
          />
          <Handle
            id="left-target"
            type="target"
            position={Position.Left}
            className="w-4 h-4 border-2 border-gray-600"
            style={{ opacity: 0 }}
          />
        </>
      )}
      {handles.right && (
        <>
          <Handle
            id="right"
            type="source"
            position={Position.Right}
            className="w-4 h-4 border-2 border-gray-600"
          />
          <Handle
            id="right-target"
            type="target"
            position={Position.Right}
            className="w-4 h-4 border-2 border-gray-600"
            style={{ opacity: 0 }}
          />
        </>
      )}

      <div className="flex flex-col space-y-2">
        {data.nodeType === "problem" ? (
          <>
            {/* Problem Badge */}
            <div className="flex items-center">
              <div className="px-2 py-0.5 bg-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-wide">
                Problem
              </div>
            </div>
            
            {/* Problem Title */}
            <div className="font-bold text-lg leading-tight">{data.problem}</div>
            
            {/* Problem Description */}
            <div className="text-xs leading-relaxed">{data.problemDescription}</div>
          </>
        ) : (
          <>
            {/* Solution Badge */}
            <div className="flex items-center">
              <div className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wide">
                Solution
              </div>
            </div>
            
            {/* Solution Title */}
            <div className="font-bold text-base leading-tight">{data.label}</div>
            
            {/* Solution Description */}
            <div className="text-xs leading-relaxed">{data.description}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(FlywheelNode);