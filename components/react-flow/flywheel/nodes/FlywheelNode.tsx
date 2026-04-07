"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

export interface FlywheelNodeData {
  label: string;
  description: string;
  problem: string;
  problemDescription: string;
  nodeType: "problem" | "step";
  showLabels?: boolean;
  handles?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  colors?: {
    problemBg: string;
    problemBorder: string;
    problemText: string;
    problemBadgeBg: string;
    problemBadgeText: string;
    solutionBg: string;
    solutionBorder: string;
    solutionText: string;
    solutionBadgeBg: string;
    solutionBadgeText: string;
  };
}

const FlywheelNode = ({ data }: { data: FlywheelNodeData }) => {
  const handles = data.handles || {
    top: true,
    right: true,
    bottom: true,
    left: true,
  };

  // Default colors if none provided — use CSS custom properties
  const defaultColors = {
    problemBg: "var(--diagram-pre-bg)",
    problemBorder: "var(--diagram-brand-blue)",
    problemText: "var(--diagram-tx-text)",
    problemBadgeBg: "var(--diagram-brand-blue)",
    problemBadgeText: "var(--diagram-pre-bg)",
    solutionBg: "var(--diagram-input-bg)",
    solutionBorder: "var(--diagram-brand-sky)",
    solutionText: "var(--diagram-tx-text)",
    solutionBadgeBg: "var(--diagram-brand-sky)",
    solutionBadgeText: "var(--diagram-pre-bg)",
  };

  const colors = data.colors || defaultColors;

  // Dynamic styles for problems vs steps
  const getNodeStyle = () => {
    if (data.nodeType === "problem") {
      return {
        backgroundColor: colors.problemBg,
        borderColor: colors.problemBorder,
        color: colors.problemText,
      };
    } else {
      return {
        backgroundColor: colors.solutionBg,
        borderColor: colors.solutionBorder,
        color: colors.solutionText,
      };
    }
  };

  return (
    <div 
      className="px-4 py-3 rounded-lg border-2 relative max-w-[260px] shadow-lg"
      style={getNodeStyle()}
    >
      {/* Handles */}
      {handles.top && (
        <>
          <Handle
            id="top"
            type="source"
            position={Position.Top}
            className="w-4 h-4 border-2 border-[var(--diagram-group-border)]"
          />
          <Handle
            id="top-target"
            type="target"
            position={Position.Top}
            className="w-4 h-4 border-2 border-[var(--diagram-group-border)]"
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
            className="w-4 h-4 border-2 border-[var(--diagram-group-border)]"
          />
          <Handle
            id="bottom-target"
            type="target"
            position={Position.Bottom}
            className="w-4 h-4 border-2 border-[var(--diagram-group-border)]"
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
            className="w-4 h-4 border-2 border-[var(--diagram-group-border)]"
          />
          <Handle
            id="left-target"
            type="target"
            position={Position.Left}
            className="w-4 h-4 border-2 border-[var(--diagram-group-border)]"
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
            className="w-4 h-4 border-2 border-[var(--diagram-group-border)]"
          />
          <Handle
            id="right-target"
            type="target"
            position={Position.Right}
            className="w-4 h-4 border-2 border-[var(--diagram-group-border)]"
            style={{ opacity: 0 }}
          />
        </>
      )}

      <div className="flex flex-col space-y-2">
        {data.nodeType === "problem" ? (
          <>
            {/* Problem Badge */}
            {data.showLabels !== false && (
              <div className="flex items-center">
                <div 
                  className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: colors.problemBadgeBg,
                    color: colors.problemBadgeText,
                  }}
                >
                  Problem
                </div>
              </div>
            )}
            
            {/* Problem Title */}
            <div className="font-bold text-lg leading-tight">{data.problem}</div>
            
            {/* Problem Description */}
            <div className="text-xs leading-relaxed">{data.problemDescription}</div>
          </>
        ) : (
          <>
            {/* Solution Badge */}
            {data.showLabels !== false && (
              <div className="flex items-center">
                <div 
                  className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: colors.solutionBadgeBg,
                    color: colors.solutionBadgeText,
                  }}
                >
                  Solution
                </div>
              </div>
            )}
            
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