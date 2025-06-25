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

// Flywheel Content Data - Edit this to change all text in the diagram
const flywheelContent = {
  problems: {
    trust: {
      title: "The Trust Problem",
      description:
        "You can't work with people you don't know. Trust systems remain localized and institutional, failing at the scale and speed required for addressing urgent global challenges.",
    },
    proof: {
      title: "The Proof Problem",
      description:
        "You can't demonstrate what you can actually do. Traditional credentialing systems fail to capture real-world capability, creating a catch-22 where you need experience to get opportunities.",
    },
    purpose: {
      title: "The Purpose Problem",
      description:
        "The work that pays doesn't solve problems that matter. Organizations optimize for self-preservation rather than impact, creating misalignment between financial security and meaningful contribution.",
    },
  },
  solutions: {
    scalableCollaboration: {
      title: "Collaboration Becomes Scalable",
      description:
        "Contributors build portable reputations and verified collaboration history, enabling teams to form across organizational boundaries based on demonstrated capability and shared purpose.",
    },
    verifiableCapabilities: {
      title: "Capabilities Become Verifiable",
      description:
        "Contributors build portable proof of their abilities through real project work, creating verifiable credentials tied to actual outcomes that transcend institutional boundaries.",
    },
    meaningfulOpportunities: {
      title: "Opportunities Become Meaningful",
      description:
        "Organizations compete on mission alignment and impact potential, creating educational pathways tied to real work where contributors build skills while solving genuine problems.",
    },
  },
  edgeLabels: {
    problemToSolution: {
      trustToScalable: "Network grows stronger",
      proofToVerifiable: "Contributors learn by doing",
      purposeToMeaningful: "Organizations create real opportunities",
    },
    flywheelFeedback: {
      scalableToProof: "Enables verified collaboration",
      verifiableToMeaningful: "Creates capability demands",
      meaningfulToTrust: "Attracts purpose-driven talent",
    },
  },
};

// Define custom node types
const nodeTypes: NodeTypes = {
  flywheelNode: FlywheelNode,
};

// Calculate circular positions using trigonometry
const calculateCircularPositions = () => {
  const centerX = 1200;
  const centerY = 1200;
  const problemRadius = 580; // Massive radius for problem nodes (outer circle)
  const solutionRadius = 580; // Massive radius for solution nodes (inner circle)

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
const createFlywheelNodes = () => {
  const { problemPositions, solutionPositions } = calculateCircularPositions();

  return [
    // Problem nodes (outer circle)
    {
      id: "trust-problem",
      type: "flywheelNode",
      data: {
        label: "",
        description: "",
        problem: flywheelContent.problems.trust.title,
        problemDescription: flywheelContent.problems.trust.description,
        nodeType: "problem" as const,
        handles: { right: true, left: true, top: true, bottom: true },
      },
      position: problemPositions[0],
    },
    {
      id: "proof-problem",
      type: "flywheelNode",
      data: {
        label: "",
        description: "",
        problem: flywheelContent.problems.proof.title,
        problemDescription: flywheelContent.problems.proof.description,
        nodeType: "problem" as const,
        handles: { right: true, left: true, top: true, bottom: true },
      },
      position: problemPositions[1],
    },
    {
      id: "purpose-problem",
      type: "flywheelNode",
      data: {
        label: "",
        description: "",
        problem: flywheelContent.problems.purpose.title,
        problemDescription: flywheelContent.problems.purpose.description,
        nodeType: "problem" as const,
        handles: { right: true, left: true, top: true, bottom: true },
      },
      position: problemPositions[2],
    },

    // Solution nodes (inner circle)
    {
      id: "scalable-collaboration",
      type: "flywheelNode",
      data: {
        label: flywheelContent.solutions.scalableCollaboration.title,
        description:
          flywheelContent.solutions.scalableCollaboration.description,
        problem: "",
        problemDescription: "",
        nodeType: "step" as const,
        handles: { right: true, left: true, top: true, bottom: true },
      },
      position: solutionPositions[0],
    },
    {
      id: "verifiable-capabilities",
      type: "flywheelNode",
      data: {
        label: flywheelContent.solutions.verifiableCapabilities.title,
        description:
          flywheelContent.solutions.verifiableCapabilities.description,
        problem: "",
        problemDescription: "",
        nodeType: "step" as const,
        handles: { right: true, left: true, top: true, bottom: true },
      },
      position: solutionPositions[1],
    },
    {
      id: "meaningful-opportunities",
      type: "flywheelNode",
      data: {
        label: flywheelContent.solutions.meaningfulOpportunities.title,
        description:
          flywheelContent.solutions.meaningfulOpportunities.description,
        problem: "",
        problemDescription: "",
        nodeType: "step" as const,
        handles: { right: true, left: true, top: true, bottom: true },
      },
      position: solutionPositions[2],
    },
  ];
};

// Create edges using the content data
const createFlywheelEdges = () => [
  // Problem to Solution edges (radial inward - problems to solutions)
  {
    id: "problem-1-to-solution",
    source: "trust-problem",
    target: "scalable-collaboration",
    sourceHandle: "right",
    targetHandle: "top-target",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#dc2626",
    },
    style: {
      strokeWidth: 8,
      stroke: "#dc2626",
    },
    animated: true,
    label: flywheelContent.edgeLabels.problemToSolution.trustToScalable,
    labelStyle: {
      fontSize: 12,
      fontWeight: 700,
      fill: "#dc2626",
    },
    labelBgStyle: {
      fill: "#fef2f2",
      fillOpacity: 0.95,
      rx: 8,
      ry: 8,
    },
  },
  {
    id: "problem-2-to-solution",
    source: "proof-problem",
    target: "verifiable-capabilities",
    sourceHandle: "bottom",
    targetHandle: "right-target",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#dc2626",
    },
    style: {
      strokeWidth: 8,
      stroke: "#dc2626",
    },
    animated: true,
    label: flywheelContent.edgeLabels.problemToSolution.proofToVerifiable,
    labelStyle: {
      fontSize: 12,
      fontWeight: 700,
      fill: "#dc2626",
    },
    labelBgStyle: {
      fill: "#fef2f2",
      fillOpacity: 0.95,
      rx: 8,
      ry: 8,
    },
  },
  {
    id: "problem-3-to-solution",
    source: "purpose-problem",
    target: "meaningful-opportunities",
    sourceHandle: "top",
    targetHandle: "bottom-target",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#dc2626",
    },
    style: {
      strokeWidth: 8,
      stroke: "#dc2626",
    },
    animated: true,
    label: flywheelContent.edgeLabels.problemToSolution.purposeToMeaningful,
    labelStyle: {
      fontSize: 12,
      fontWeight: 700,
      fill: "#dc2626",
    },
    labelBgStyle: {
      fill: "#fef2f2",
      fillOpacity: 0.95,
      rx: 8,
      ry: 8,
    },
  },

  // Circular flywheel edges (solution to next problem clockwise)
  {
    id: "solution-1-feedback",
    source: "scalable-collaboration",
    target: "proof-problem",
    sourceHandle: "bottom",
    targetHandle: "top-target",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2563eb",
    },
    style: {
      strokeWidth: 6,
      stroke: "#2563eb",
      strokeDasharray: "12,6",
    },
    label: flywheelContent.edgeLabels.flywheelFeedback.scalableToProof,
    labelStyle: {
      fontSize: 11,
      fontWeight: 600,
      fill: "#2563eb",
    },
    labelBgStyle: {
      fill: "#eff6ff",
      fillOpacity: 0.95,
      rx: 6,
      ry: 6,
    },
  },
  {
    id: "solution-2-feedback",
    source: "verifiable-capabilities",
    target: "purpose-problem",
    sourceHandle: "left",
    targetHandle: "bottom-target",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2563eb",
    },
    style: {
      strokeWidth: 6,
      stroke: "#2563eb",
      strokeDasharray: "12,6",
    },
    label: flywheelContent.edgeLabels.flywheelFeedback.verifiableToMeaningful,
    labelStyle: {
      fontSize: 11,
      fontWeight: 600,
      fill: "#2563eb",
    },
    labelBgStyle: {
      fill: "#eff6ff",
      fillOpacity: 0.95,
      rx: 6,
      ry: 6,
    },
  },
  {
    id: "solution-3-feedback",
    source: "meaningful-opportunities",
    target: "trust-problem",
    sourceHandle: "top",
    targetHandle: "left-target",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2563eb",
    },
    style: {
      strokeWidth: 6,
      stroke: "#2563eb",
      strokeDasharray: "12,6",
    },
    label: flywheelContent.edgeLabels.flywheelFeedback.meaningfulToTrust,
    labelStyle: {
      fontSize: 11,
      fontWeight: 600,
      fill: "#2563eb",
    },
    labelBgStyle: {
      fill: "#eff6ff",
      fillOpacity: 0.95,
      rx: 6,
      ry: 6,
    },
  },
];

export default function FlywheelDiagram() {
  const [nodes, , onNodesChange] = useNodesState<Node>(createFlywheelNodes());
  const [edges, , onEdgesChange] = useEdgesState<Edge>(createFlywheelEdges());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

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
        <Background color="#f3f4f6" gap={20} />
        <Panel position="top-right">
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
        </Panel>
        <Panel position="top-left">
          <div className="bg-white bg-opacity-95 p-4 rounded-lg shadow-lg max-w-sm">
            <h3 className="font-bold text-base mb-2 text-gray-800">
              The Andamio Flywheel
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-red-500 rounded"></div>
                <span className="text-gray-700">Problems → Solutions</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-0.5 bg-blue-500 rounded border border-blue-500"
                  style={{ borderStyle: "dashed" }}
                ></div>
                <span className="text-gray-700">Flywheel feedback</span>
              </div>
            </div>
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
