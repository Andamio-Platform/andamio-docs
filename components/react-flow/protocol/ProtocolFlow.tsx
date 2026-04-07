"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  ReactFlowProvider,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom node component
import ProtocolNode from "./nodes/ProtocolNode";

// Define custom node types
const nodeTypes: NodeTypes = {
  protocolNode: ProtocolNode,
};

// Protocol data
const protocolData = {
  nodes: [
    {
      id: "index-validators",
      type: "protocolNode",
      data: {
        label: "Index Validators",
        description: "Ensures uniqueness of access tokens",
        handles: { right: true, left: false, top: false, bottom: false },
        href: "/docs/protocol/v2/validators/index-validators",
      },
      position: { x: 50, y: 50 },
    },
    {
      id: "global-state",
      type: "protocolNode",
      data: {
        label: "Global State",
        description: "Tracks user credentials",
        handles: {
          right: true,
          left: true,
          top: false,
          bottom: false,
          bottomLeft: true,
          bottomRight: true,
        },
        href: "/docs/protocol/v2/validators/global-state",
      },
      position: { x: 400, y: 50 },
    },
    {
      id: "instance",
      type: "protocolNode",
      data: {
        label: "Instance System",
        description: "Enables creation of local instances",
        handles: { right: false, left: true, top: false, bottom: true },
        href: "/docs/protocol/v2/validators/instance",
      },
      position: { x: 650, y: 50 },
    },
    {
      id: "course",
      type: "protocolNode",
      data: {
        label: "Course System",
        description:
          "Tracks assignment completion and issues learning credentials",
        handles: { right: false, left: false, top: true, bottom: false },
        href: "/docs/protocol/v2/validators/course",
      },
      position: { x: 390, y: 290 },
    },
    {
      id: "project",
      type: "protocolNode",
      data: {
        label: "Project System",
        description: "Hosts project governance and treasury management",
        handles: { right: false, left: false, top: true, bottom: false },
        href: "/docs/protocol/v2/validators/project",
      },
      position: { x: 690, y: 290 },
    },
  ],
  edges: [
    {
      id: "index-to-global",
      source: "index-validators",
      target: "global-state",
      sourceHandle: "right",
      targetHandle: "left",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { strokeWidth: 2 },
    },
    {
      id: "global-to-instance",
      source: "global-state",
      target: "instance",
      sourceHandle: "right",
      targetHandle: "left",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { strokeWidth: 2 },
    },
    {
      id: "instance-to-course",
      source: "instance",
      target: "course",
      sourceHandle: "bottom",
      targetHandle: "top",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { strokeWidth: 2 },
    },
    {
      id: "instance-to-project",
      source: "instance",
      target: "project",
      sourceHandle: "bottom",
      targetHandle: "top",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { strokeWidth: 2 },
    },
    {
      id: "global-to-course",
      source: "global-state",
      target: "course",
      sourceHandle: "bottomLeft",
      targetHandle: "top",
      markerStart: {
        type: MarkerType.ArrowClosed,
        color: "var(--diagram-validator-border)",
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "var(--diagram-validator-border)",
      },
      style: { strokeWidth: 2, stroke: "var(--diagram-validator-border)" }, // Indigo color
      animated: true,
    },
    {
      id: "global-to-project",
      source: "global-state",
      target: "project",
      sourceHandle: "bottomRight",
      targetHandle: "top",
      markerStart: {
        type: MarkerType.ArrowClosed,
        color: "var(--diagram-validator-border)",
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "var(--diagram-validator-border)",
      },
      style: { strokeWidth: 2, stroke: "var(--diagram-validator-border)" }, // Indigo color
      animated: true,
    },
  ],
};

export default function ProtocolFlow() {
  const [nodes /* setNodes */, , onNodesChange] = useNodesState<Node>(
    protocolData.nodes
  );
  const [edges /* setEdges */, , onEdgesChange] = useEdgesState<Edge>(
    protocolData.edges
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Initialize the ReactFlow instance
  const onInit = useCallback((instance: ReactFlowInstance<Node, Edge>) => {
    setReactFlowInstance(instance);
    instance.fitView({ padding: 0.1, includeHiddenNodes: false });
  }, []);

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen((prev) => {
      // Use setTimeout to ensure the DOM has updated before fitting view
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
        }
      }, 50);
      return !prev;
    });
  };

  // Render the diagram
  const renderDiagram = () => {
    return (
      <ReactFlow<Node, Edge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Panel position="top-right">
          <button
            onClick={toggleFullScreen}
            className="bg-card text-card-foreground hover:bg-accent p-2 rounded flex items-center shadow transition-colors"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
            )}
          </button>
        </Panel>
      </ReactFlow>
    );
  };

  return (
    <div
      className={`${isFullScreen ? "fixed inset-0 z-50 bg-background" : "w-full"} ${isFullScreen ? "h-screen" : "h-[600px]"} transition-all duration-300`}
    >
      <ReactFlowProvider>{renderDiagram()}</ReactFlowProvider>
    </div>
  );
}
