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
import FlywheelNode from "./nodes/FlywheelNode";

// Import diagram data
import { LinearDiagramVersion, linearDiagramVersions } from "./linearData";

// Edge styling variables - edit these to change arrow and line appearance
const edgeStyles = {
  strokeWidth: 6,
  arrowWidth: 5,
  arrowHeight: 5,
};

// Andamio Brand Color Scheme
const colors = {
  // Problem to solution edges (solid lines) - using green for bi-directional flow
  problemToSolution: "var(--diagram-brand-mint)",
  problemToSolutionBg: "var(--diagram-input-bg)",

  // Background
  diagramBg: "var(--diagram-group-bg)",
};

// Node color scheme - using core Andamio brand colors
const nodeColors = {
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

// Define custom node types
const nodeTypes: NodeTypes = {
  flywheelNode: FlywheelNode,
};

// Calculate linear positions for problem-solution pairs
const calculateLinearPositions = (pairCount: number) => {
  const verticalSpacing = 200; // Space between pairs
  const horizontalSpacing = 600; // Space between problem and solution (increased)
  const startY = 100; // Starting Y position
  const problemX = 100; // X position for problems (left side)
  const solutionX = problemX + horizontalSpacing; // X position for solutions (right side)

  const positions = [];

  for (let i = 0; i < pairCount; i++) {
    const y = startY + i * verticalSpacing;
    positions.push({
      problem: { x: problemX, y },
      solution: { x: solutionX, y },
    });
  }

  return positions;
};

// Create nodes using the content data
const createLinearNodes = (
  linearContent: LinearDiagramVersion["content"],
  showLabels = true
) => {
  const nodes: Node[] = [];
  const positions = calculateLinearPositions(linearContent.pairs.length);

  linearContent.pairs.forEach((pair, index) => {
    const position = positions[index];

    // Problem node (left side)
    nodes.push({
      id: `problem-${pair.id}`,
      type: "flywheelNode",
      data: {
        label: "",
        description: "",
        problem: pair.problem.title,
        problemDescription: pair.problem.description,
        nodeType: "problem" as const,
        showLabels,
        handles: { right: true, left: false, top: false, bottom: false },
        colors: nodeColors,
      },
      position: position.problem,
    });

    // Solution node (right side)
    nodes.push({
      id: `solution-${pair.id}`,
      type: "flywheelNode",
      data: {
        label: pair.solution.title,
        description: pair.solution.description,
        problem: "",
        problemDescription: "",
        nodeType: "step" as const,
        showLabels,
        handles: { right: false, left: true, top: false, bottom: false },
        colors: nodeColors,
      },
      position: position.solution,
    });
  });

  return nodes;
};

// Create edges connecting problems to solutions
const createLinearEdges = (linearContent: LinearDiagramVersion["content"]) => {
  const edges: Edge[] = [];

  linearContent.pairs.forEach((pair) => {
    // Forward edge (problem to solution)
    edges.push({
      id: `edge-forward-${pair.id}`,
      source: `problem-${pair.id}`,
      target: `solution-${pair.id}`,
      sourceHandle: "right",
      targetHandle: "left-target",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: colors.problemToSolution,
        width: edgeStyles.arrowWidth,
        height: edgeStyles.arrowHeight,
      },
      style: {
        strokeWidth: edgeStyles.strokeWidth,
        stroke: colors.problemToSolution,
      },
      animated: true,
      label: pair.edgeLabel,
      labelStyle: {
        fontSize: 14,
        fontWeight: 700,
        fill: "var(--diagram-tx-text)",
      },
      labelBgStyle: {
        fill: colors.problemToSolutionBg,
        fillOpacity: 0.95,
      },
      labelBgPadding: [8, 16] as [number, number], // [vertical, horizontal] padding
    });
  });

  return edges;
};

interface LinearDiagramProps {
  initialDiagram?: string;
  showDropdown?: boolean;
}

export default function LinearDiagram({
  initialDiagram,
  showDropdown = true,
}: LinearDiagramProps) {
  const getInitialVersion = () => {
    if (initialDiagram) {
      const found = linearDiagramVersions.find((v) => v.id === initialDiagram);
      return found || linearDiagramVersions[0];
    }
    return linearDiagramVersions[0];
  };

  const [selectedVersion, setSelectedVersion] = useState(getInitialVersion());
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    createLinearNodes(selectedVersion.content, selectedVersion.showLabels)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    createLinearEdges(selectedVersion.content)
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Handle version change
  const handleVersionChange = (versionId: string) => {
    const newVersion = linearDiagramVersions.find((v) => v.id === versionId);
    if (newVersion) {
      setSelectedVersion(newVersion);
      setNodes(createLinearNodes(newVersion.content, newVersion.showLabels));
      setEdges(createLinearEdges(newVersion.content));

      // Fit view after a short delay to ensure nodes are updated
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
        }
      }, 100);
    }
  };

  // Initialize the ReactFlow instance
  const onInit = useCallback((instance: ReactFlowInstance<Node, Edge>) => {
    setReactFlowInstance(instance);
    instance.fitView({
      padding: 0.1,
      includeHiddenNodes: false,
      minZoom: 0.3,
      maxZoom: 1.5,
    });
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
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
      >
        <Background color={colors.diagramBg} gap={20} />
        <Panel position="top-right">
          <div className="flex gap-2">
            {showDropdown && (
              <select
                value={selectedVersion.id}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="bg-[var(--diagram-tx-border)] hover:opacity-90 text-[var(--diagram-pre-bg)] px-3 py-2 rounded text-sm font-medium shadow transition-colors border border-[var(--diagram-group-border)]"
              >
                {linearDiagramVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={toggleFullScreen}
              className="bg-[var(--diagram-tx-border)] hover:opacity-90 text-[var(--diagram-pre-bg)] p-2 rounded flex items-center shadow transition-colors"
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
          </div>
        </Panel>
      </ReactFlow>
    );
  };

  return (
    <div
      className={`${isFullScreen ? "fixed inset-0 z-50 bg-[var(--background)]" : "w-full"} ${isFullScreen ? "h-screen" : "h-[600px]"} transition-all duration-300 border border-[var(--border)] rounded-lg overflow-hidden`}
    >
      <ReactFlowProvider>{renderDiagram()}</ReactFlowProvider>
    </div>
  );
}
