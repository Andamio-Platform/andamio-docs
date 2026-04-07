"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";

export interface ProtocolNodeData {
  label: string;
  description: string;
  type?: string;
  href?: string;
  handles?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
    bottomLeft?: boolean;
    bottomRight?: boolean;
  };
}

const ProtocolNode = ({ data }: { data: ProtocolNodeData }) => {
  // Default to showing all handles if not specified
  const handles = data.handles || {
    top: true,
    right: true,
    bottom: true,
    left: true,
  };

  return (
    <div className="px-4 py-4 shadow-md rounded-md relative max-w-[200px]" style={{ backgroundColor: 'var(--diagram-system-bg)', borderColor: 'var(--diagram-system-border)', color: 'var(--diagram-system-text)', borderWidth: '1px', borderStyle: 'solid' }}>
      {/* Conditionally render handles based on props */}
      {handles.top && (
        <Handle
          id="top"
          type="target"
          position={Position.Top}
          className="w-3 h-3"
        />
      )}
      {handles.bottom && (
        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          className="w-3 h-3"
        />
      )}
      {handles.bottomLeft && (
        <Handle
          id="bottomLeft"
          type="source"
          position={Position.Bottom}
          className="w-3 h-3"
          style={{ left: '25%' }}
        />
      )}
      {handles.bottomRight && (
        <Handle
          id="bottomRight"
          type="source"
          position={Position.Bottom}
          className="w-3 h-3"
          style={{ left: '75%' }}
        />
      )}
      {handles.left && (
        <Handle
          id="left"
          type="target"
          position={Position.Left}
          className="w-3 h-3"
        />
      )}
      {handles.right && (
        <Handle
          id="right"
          type="source"
          position={Position.Right}
          className="w-3 h-3"
        />
      )}

      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          {data.href ? (
            <Link 
              href={data.href}
              className="font-bold text-lg hover:opacity-70 transition-colors"
              style={{ color: 'var(--diagram-system-text)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {data.label}
            </Link>
          ) : (
            <div className="font-bold text-lg">{data.label}</div>
          )}
        </div>
        <div className="text-xs">
          <div className="text-xs mt-1">{data.description}</div>
          {data.href && (
            <div className="mt-2">
              <Link 
                href={data.href} 
                className="hover:underline text-xs flex items-center transition-colors"
                style={{ color: 'var(--diagram-validator-border)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Docs
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ProtocolNode);
