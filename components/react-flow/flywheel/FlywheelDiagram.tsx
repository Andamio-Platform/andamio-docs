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
import { DiagramVersion, diagramVersions } from "./flywheelData";

// Edge styling variables - edit these to change arrow and line appearance
const edgeStyles = {
  strokeWidth: 9,
  arrowWidth: 6,
  arrowHeight: 6,
};

// Andamio Brand Color Scheme
const colors = {
  // Problem to solution edges (solid lines) - using Coral for urgent action
  problemToSolution: "#FF5A5F", // Coral
  problemToSolutionBg: "#E6F0F5", // Light Background

  // Flywheel feedback edges (dashed lines) - using Mint Green for positive growth
  flywheelFeedback: "#00BFA5", // Mint Green
  flywheelFeedbackBg: "#E6F0F5", // Light Background

  // Background
  diagramBg: "#F3F4F6", // Light Grey
};

// Node color scheme - using core Andamio brand colors
const nodeColors = {
  problemBg: "#FFFFFF", // White background
  problemBorder: "#003C54", // Andamio Blue for problems
  problemText: "#1E1E1E", // Black Text
  problemBadgeBg: "#003C54", // Andamio Blue badge
  problemBadgeText: "#FFFFFF", // White text on blue
  solutionBg: "#E6F0F5", // Light Background for solutions
  solutionBorder: "#007ACC", // Sky Blue for solutions
  solutionText: "#1E1E1E", // Black Text
  solutionBadgeBg: "#007ACC", // Sky Blue badge
  solutionBadgeText: "#FFFFFF", // White text on blue
};

// Define custom node types
const nodeTypes: NodeTypes = {
  flywheelNode: FlywheelNode,
};

// Calculate circular positions using trigonometry
const calculateCircularPositions = (hasBothTypes = true) => {
  const centerX = 1200;
  const centerY = 1200;
  // Reduce radius for single-type diagrams (less content)
  const baseRadius = hasBothTypes ? 580 : 450;
  const problemRadius = baseRadius; // Radius for problem nodes
  const solutionRadius = baseRadius; // Radius for solution nodes

  // Problem nodes evenly spaced at 120-degree intervals
  const problemAngles = [
    -Math.PI / 2, // Top (Education) - 270° or -90°
    -Math.PI / 2 + (2 * Math.PI) / 3, // Bottom-right (Oracle) - 30°
    -Math.PI / 2 + (4 * Math.PI) / 3, // Bottom-left (Organization) - 150°
  ];

  // Solution nodes positioned exactly between problems (offset by 60°)
  const solutionAngles = [
    -Math.PI / 2 + Math.PI / 3, // Between Education and Oracle - 330° or -30°
    -Math.PI / 2 + Math.PI, // Between Oracle and Organization - 90°
    -Math.PI / 2 + (5 * Math.PI) / 3, // Between Organization and Education - 210°
  ];

  const verticalSquishFactor = 0.7; // Squish vertically to 70% height

  const problemPositions = problemAngles.map((angle) => ({
    x: centerX + problemRadius * Math.cos(angle) - 130, // Center the 260px wide node
    y: centerY + problemRadius * Math.sin(angle) * verticalSquishFactor - 60, // Squished vertically
  }));

  const solutionPositions = solutionAngles.map((angle) => ({
    x: centerX + solutionRadius * Math.cos(angle) - 130,
    y: centerY + solutionRadius * Math.sin(angle) * verticalSquishFactor - 60, // Squished vertically
  }));

  return { problemPositions, solutionPositions };
};

// Create nodes using the content data
const createFlywheelNodes = (
  flywheelContent: DiagramVersion["content"],
  showLabels = true
) => {
  const hasBothTypes = !!(
    flywheelContent.problems && flywheelContent.solutions
  );
  const { problemPositions, solutionPositions } =
    calculateCircularPositions(hasBothTypes);

  const nodes: Node[] = [];

  // Add solution nodes if solutions are provided
  if (flywheelContent.solutions) {
    nodes.push(
      // Solution nodes (outer circle)
      {
        id: "one-solution",
        type: "flywheelNode",
        data: {
          label: flywheelContent.solutions.one.title,
          description: flywheelContent.solutions.one.description,
          problem: "",
          problemDescription: "",
          nodeType: "step" as const,
          showLabels,
          handles: { right: true, left: true, top: true, bottom: true },
          colors: nodeColors,
        },
        position: solutionPositions[0],
      },
      {
        id: "two-solution",
        type: "flywheelNode",
        data: {
          label: flywheelContent.solutions.two.title,
          description: flywheelContent.solutions.two.description,
          problem: "",
          problemDescription: "",
          nodeType: "step" as const,
          showLabels,
          handles: { right: true, left: true, top: true, bottom: true },
          colors: nodeColors,
        },
        position: solutionPositions[1],
      },
      {
        id: "three-solution",
        type: "flywheelNode",
        data: {
          label: flywheelContent.solutions.three.title,
          description: flywheelContent.solutions.three.description,
          problem: "",
          problemDescription: "",
          nodeType: "step" as const,
          showLabels,
          handles: { right: true, left: true, top: true, bottom: true },
          colors: nodeColors,
        },
        position: solutionPositions[2],
      }
    );
  }

  // Add problem nodes if problems are provided
  if (flywheelContent.problems) {
    nodes.push(
      // Problem nodes (inner circle)
      {
        id: "one-to-two",
        type: "flywheelNode",
        data: {
          label: "",
          description: "",
          problem: flywheelContent.problems.oneToTwo.title,
          problemDescription: flywheelContent.problems.oneToTwo.description,
          nodeType: "problem" as const,
          showLabels,
          handles: { right: true, left: true, top: true, bottom: true },
          colors: nodeColors,
        },
        position: problemPositions[0],
      },
      {
        id: "two-to-three",
        type: "flywheelNode",
        data: {
          label: "",
          description: "",
          problem: flywheelContent.problems.twoToThree.title,
          problemDescription: flywheelContent.problems.twoToThree.description,
          nodeType: "problem" as const,
          showLabels,
          handles: { right: true, left: true, top: true, bottom: true },
          colors: nodeColors,
        },
        position: problemPositions[1],
      },
      {
        id: "three-to-one",
        type: "flywheelNode",
        data: {
          label: "",
          description: "",
          problem: flywheelContent.problems.threeToOne.title,
          problemDescription: flywheelContent.problems.threeToOne.description,
          nodeType: "problem" as const,
          showLabels,
          handles: { right: true, left: true, top: true, bottom: true },
          colors: nodeColors,
        },
        position: problemPositions[2],
      }
    );
  }

  return nodes;
};

// Create edges using the content data
const createFlywheelEdges = (flywheelContent: DiagramVersion["content"]) => {
  const edges: Edge[] = [];

  // Only create problem-to-solution edges if both exist
  if (
    flywheelContent.problems &&
    flywheelContent.solutions &&
    flywheelContent.edgeLabels?.solutionToConnection
  ) {
    edges.push(
      // Problem to Solution edges (radial inward - problems to solutions)
      {
        id: "problem-1-to-solution",
        source: "one-to-two",
        target: "one-solution",
        sourceHandle: "right",
        targetHandle: "top-target",
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
        label: flywheelContent.edgeLabels.solutionToConnection.oneToTwo,
        labelStyle: {
          fontSize: 14,
          fontWeight: 700,
          fill: "#1E1E1E", // Black text for better readability
        },
        labelBgStyle: {
          fill: colors.problemToSolutionBg,
          fillOpacity: 0.95,
        },
        labelBgPadding: [8, 16] as [number, number], // [vertical, horizontal] padding
      },
      {
        id: "problem-2-to-solution",
        source: "two-to-three",
        target: "two-solution",
        sourceHandle: "bottom",
        targetHandle: "right-target",
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
        label: flywheelContent.edgeLabels.solutionToConnection.twoToThree,
        labelStyle: {
          fontSize: 14,
          fontWeight: 700,
          fill: "#1E1E1E", // Black text for better readability
        },
        labelBgStyle: {
          fill: colors.problemToSolutionBg,
          fillOpacity: 0.95,
        },
        labelBgPadding: [8, 16] as [number, number], // [vertical, horizontal] padding
      },
      {
        id: "problem-3-to-solution",
        source: "three-to-one",
        target: "three-solution",
        sourceHandle: "top",
        targetHandle: "bottom-target",
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
        label: flywheelContent.edgeLabels.solutionToConnection.threeToOne,
        labelStyle: {
          fontSize: 14,
          fontWeight: 700,
          fill: "#1E1E1E", // Black text for better readability
        },
        labelBgStyle: {
          fill: colors.problemToSolutionBg,
          fillOpacity: 0.95,
        },
        labelBgPadding: [8, 16] as [number, number], // [vertical, horizontal] padding
      }
    );
  }

  // Create flywheel feedback edges based on what nodes exist
  if (flywheelContent.edgeLabels?.flywheelFeedback) {
    if (flywheelContent.solutions) {
      // Solution to problem edges (if both exist) or solution to solution (if problems don't exist)
      const targetType = flywheelContent.problems ? "problem" : "solution";
      edges.push(
        // Solution to next problem/solution clockwise
        {
          id: "solution-1-feedback",
          source: "one-solution",
          target: targetType === "problem" ? "two-to-three" : "two-solution",
          sourceHandle: "bottom",
          targetHandle:
            targetType === "problem" ? "top-target" : "right-target",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.flywheelFeedback,
            width: edgeStyles.arrowWidth,
            height: edgeStyles.arrowHeight,
          },
          style: {
            strokeWidth: edgeStyles.strokeWidth,
            stroke: colors.flywheelFeedback,
            strokeDasharray: "12,6",
          },
          label: flywheelContent.edgeLabels.flywheelFeedback.oneToTwo,
          labelStyle: {
            fontSize: 14,
            fontWeight: 600,
            fill: "#1E1E1E",
          },
          labelBgStyle: {
            fill: colors.flywheelFeedbackBg,
            fillOpacity: 0.95,
          },
          labelBgPadding: [8, 16] as [number, number],
        },
        {
          id: "solution-2-feedback",
          source: "two-solution",
          target: targetType === "problem" ? "three-to-one" : "three-solution",
          sourceHandle: "left",
          targetHandle: "bottom-target",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.flywheelFeedback,
            width: edgeStyles.arrowWidth,
            height: edgeStyles.arrowHeight,
          },
          style: {
            strokeWidth: edgeStyles.strokeWidth,
            stroke: colors.flywheelFeedback,
            strokeDasharray: "12,6",
          },
          label: flywheelContent.edgeLabels.flywheelFeedback.twoToThree,
          labelStyle: {
            fontSize: 14,
            fontWeight: 600,
            fill: "#1E1E1E",
          },
          labelBgStyle: {
            fill: colors.flywheelFeedbackBg,
            fillOpacity: 0.95,
          },
          labelBgPadding: [8, 16] as [number, number],
        },
        {
          id: "solution-3-feedback",
          source: "three-solution",
          target: targetType === "problem" ? "one-to-two" : "one-solution",
          sourceHandle: targetType === "problem" ? "top" : "right",
          targetHandle:
            targetType === "problem" ? "left-target" : "left-target",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.flywheelFeedback,
            width: edgeStyles.arrowWidth,
            height: edgeStyles.arrowHeight,
          },
          style: {
            strokeWidth: edgeStyles.strokeWidth,
            stroke: colors.flywheelFeedback,
            strokeDasharray: "12,6",
          },
          label: flywheelContent.edgeLabels.flywheelFeedback.threeToOne,
          labelStyle: {
            fontSize: 14,
            fontWeight: 600,
            fill: "#1E1E1E",
          },
          labelBgStyle: {
            fill: colors.flywheelFeedbackBg,
            fillOpacity: 0.95,
          },
          labelBgPadding: [8, 16] as [number, number],
        }
      );
    } else if (flywheelContent.problems) {
      // Problem to problem edges (if only problems exist)
      edges.push(
        {
          id: "problem-1-feedback",
          source: "one-to-two",
          target: "two-to-three",
          sourceHandle: "right",
          targetHandle: "top-target",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.flywheelFeedback,
            width: edgeStyles.arrowWidth,
            height: edgeStyles.arrowHeight,
          },
          style: {
            strokeWidth: edgeStyles.strokeWidth,
            stroke: colors.flywheelFeedback,
            strokeDasharray: "12,6",
          },
          label: flywheelContent.edgeLabels.flywheelFeedback.oneToTwo,
          labelStyle: {
            fontSize: 14,
            fontWeight: 600,
            fill: "#1E1E1E",
          },
          labelBgStyle: {
            fill: colors.flywheelFeedbackBg,
            fillOpacity: 0.95,
          },
          labelBgPadding: [8, 16] as [number, number],
        },
        {
          id: "problem-2-feedback",
          source: "two-to-three",
          target: "three-to-one",
          sourceHandle: "left",
          targetHandle: "right-target",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.flywheelFeedback,
            width: edgeStyles.arrowWidth,
            height: edgeStyles.arrowHeight,
          },
          style: {
            strokeWidth: edgeStyles.strokeWidth,
            stroke: colors.flywheelFeedback,
            strokeDasharray: "12,6",
          },
          label: flywheelContent.edgeLabels.flywheelFeedback.twoToThree,
          labelStyle: {
            fontSize: 14,
            fontWeight: 600,
            fill: "#1E1E1E",
          },
          labelBgStyle: {
            fill: colors.flywheelFeedbackBg,
            fillOpacity: 0.95,
          },
          labelBgPadding: [8, 16] as [number, number],
        },
        {
          id: "problem-3-feedback",
          source: "three-to-one",
          target: "one-to-two",
          sourceHandle: "top",
          targetHandle: "left-target",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colors.flywheelFeedback,
            width: edgeStyles.arrowWidth,
            height: edgeStyles.arrowHeight,
          },
          style: {
            strokeWidth: edgeStyles.strokeWidth,
            stroke: colors.flywheelFeedback,
            strokeDasharray: "12,6",
          },
          label: flywheelContent.edgeLabels.flywheelFeedback.threeToOne,
          labelStyle: {
            fontSize: 14,
            fontWeight: 600,
            fill: "#1E1E1E",
          },
          labelBgStyle: {
            fill: colors.flywheelFeedbackBg,
            fillOpacity: 0.95,
          },
          labelBgPadding: [8, 16] as [number, number],
        }
      );
    }
  }

  return edges;
};

// Comments explaining the Three Ps alignment:
// - Course Local State → Purpose (meaningful work and learning)
// - Access Token → Participation (trusted authentication and access)
// - Global State → Proof (verifiable contributions and portable reputation)
// - Project Local State connects Purpose to Participation through coordinated treasury and governance

interface FlywheelDiagramProps {
  initialDiagram?: string;
  showDropdown?: boolean;
}

export default function FlywheelDiagram({ 
  initialDiagram, 
  showDropdown = true 
}: FlywheelDiagramProps) {
  const getInitialVersion = () => {
    if (initialDiagram) {
      const found = diagramVersions.find(v => v.id === initialDiagram);
      return found || diagramVersions[0];
    }
    return diagramVersions[0];
  };

  const [selectedVersion, setSelectedVersion] = useState(getInitialVersion());
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    createFlywheelNodes(selectedVersion.content, selectedVersion.showLabels)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    createFlywheelEdges(selectedVersion.content)
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Handle version change
  const handleVersionChange = (versionId: string) => {
    const newVersion = diagramVersions.find((v) => v.id === versionId);
    if (newVersion) {
      setSelectedVersion(newVersion);
      setNodes(createFlywheelNodes(newVersion.content, newVersion.showLabels));
      setEdges(createFlywheelEdges(newVersion.content));

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
      padding: 0.05,
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
        defaultViewport={{ x: 0, y: 0, zoom: 0.3 }}
      >
        <Background color={colors.diagramBg} gap={20} />
        <Panel position="top-right">
          <div className="flex gap-2">
            {showDropdown && (
              <select
                value={selectedVersion.id}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium shadow transition-colors border border-gray-600"
              >
                {diagramVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={toggleFullScreen}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded flex items-center shadow transition-colors"
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
      className={`${isFullScreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : "w-full"} ${isFullScreen ? "h-screen" : "h-[600px]"} transition-all duration-300 border border-gray-200 rounded-lg overflow-hidden`}
    >
      <ReactFlowProvider>{renderDiagram()}</ReactFlowProvider>
    </div>
  );
}
