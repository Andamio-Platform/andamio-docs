"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  ReactFlowProvider,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import yaml from "js-yaml";

// Custom node components
import ValidatorNode from "./nodes/ValidatorNode";
import RedeemerNode from "./nodes/RedeemerNode";

// Import types
import {
  DiagramValidatorOverviewProps,
  Registry,
  RedeemerAction,
} from "@/types";

// Define node types for React Flow
const nodeTypes = {
  validatorNode: ValidatorNode,
  redeemerNode: RedeemerNode,
};

export default function ValidatorDiagram({
  system,
  validatorId,
}: DiagramValidatorOverviewProps) {
  return <DiagramValidatorOverview system={system} validatorId={validatorId} />;
}

// Client-side only diagram component to avoid hydration mismatches
function DiagramValidatorOverview({
  system,
  validatorId,
}: DiagramValidatorOverviewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  console.log(system, validatorId);

  // State for registry data
  const [registryData, setRegistryData] = useState<Registry | null>(null);
  const [isRegistryLoading, setIsRegistryLoading] = useState(true);

  // Fetch registry data
  useEffect(() => {
    const fetchRegistryData = async () => {
      try {
        const response = await fetch("/yaml/registry.yaml");
        const yamlText = await response.text();
        const data = yaml.load(yamlText) as Registry;
        setRegistryData(data);
        setIsRegistryLoading(false);
      } catch (error) {
        console.error("Error loading registry data:", error);
        setIsRegistryLoading(false);
      }
    };

    fetchRegistryData();
  }, []);

  // Initialize the diagram with validator data
  useEffect(() => {
    const initDiagram = async () => {
      if (isRegistryLoading || !registryData) return;

      try {
        console.log("Initializing validator diagram for:", system, validatorId);

        const diagramNodes: Node[] = [];
        const diagramEdges: Edge[] = [];

        // Find the validator in the registry
        const validator = registryData.systems[system]?.validators[validatorId];

        if (!validator) {
          console.error(
            `Validator ${validatorId} not found in system ${system}`
          );
          setLoading(false);
          return;
        }

        console.log(`Validator data for ${validatorId}:`, validator);

        // Create validator node
        const validatorNode: Node = {
          id: "validator-node",
          type: "validatorNode",
          position: { x: 400, y: 150 },
          data: {
            name: validator.name,
            purpose: Array.isArray(validator.purpose)
              ? validator.purpose.join(", ")
              : validator.purpose,
            system: system,
          },
        };
        diagramNodes.push(validatorNode);

        // Process redeemers
        const redeemerData = validator.redeemer;

        // Calculate starting Y position for redeemers
        let redeemerY = 80;
        const redeemerSpacing = 120;

        if (redeemerData) {
          const redeemers = Array.isArray(redeemerData)
            ? redeemerData
            : [redeemerData];

          redeemers.forEach((redeemer, redeemerIndex) => {
            // Skip empty redeemer objects
            if (redeemer && Object.keys(redeemer).length === 0) {
              return;
            }

            if (redeemer.type === "bytes" || !redeemer.type) {
              // Simple redeemer type
              const redeemerNode: Node = {
                id: `redeemer-node-${redeemerIndex}`,
                type: "redeemerNode",
                position: { x: 800, y: redeemerY },
                data: {
                  type: redeemer.type || "bytes",
                  transaction: redeemer.transaction || "",
                },
              };
              diagramNodes.push(redeemerNode);

              // Create edge from validator to redeemer
              const edge: Edge = {
                id: `edge-validator-to-redeemer-${redeemerIndex}`,
                source: "validator-node",
                target: `redeemer-node-${redeemerIndex}`,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              };
              diagramEdges.push(edge);

              redeemerY += redeemerSpacing;
            } else {
              // Complex redeemer type with actions
              const actionKey = Object.keys(redeemer).find(
                (key) => key !== "type"
              );

              if (actionKey) {
                // Handle both array and non-array action values
                const actions = Array.isArray(redeemer[actionKey])
                  ? redeemer[actionKey]
                  : [redeemer[actionKey]];

                actions.forEach(
                  (
                    action: RedeemerAction | Record<string, string | string[]>,
                    actionIndex: number
                  ) => {
                    // Handle different action structures
                    const actionName = action.action || actionKey;
                    const transaction = action.transaction || "";

                    const redeemerNode: Node = {
                      id: `redeemer-node-${redeemerIndex}-${actionIndex}`,
                      type: "redeemerNode",
                      position: { x: 800, y: redeemerY },
                      data: {
                        type: redeemer.type || actionKey,
                        action: actionName,
                        transaction: transaction,
                      },
                    };
                    diagramNodes.push(redeemerNode);

                    // Create edge from validator to redeemer
                    const edge: Edge = {
                      id: `edge-validator-to-redeemer-${redeemerIndex}-${actionIndex}`,
                      source: "validator-node",
                      target: `redeemer-node-${redeemerIndex}-${actionIndex}`,
                      markerEnd: {
                        type: MarkerType.ArrowClosed,
                      },
                    };
                    diagramEdges.push(edge);

                    redeemerY += redeemerSpacing;
                  }
                );
              }
            }
          });
        }

        // Set the nodes and edges
        setNodes(diagramNodes);
        setEdges(diagramEdges);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing validator diagram:", error);
        setLoading(false);
      }
    };

    initDiagram();
  }, [
    registryData,
    isRegistryLoading,
    system,
    validatorId,
    setNodes,
    setEdges,
  ]);

  // Fit view to the graph when nodes change
  const onInit = useCallback((instance: ReactFlowInstance<Node, Edge>) => {
    setReactFlowInstance(instance);
    instance.fitView({ padding: 0.2 });
  }, []);

  // Effect to fit view when full screen mode changes
  useEffect(() => {
    if (reactFlowInstance && !loading) {
      // Small delay to ensure the container has resized
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }, 50);
    }
  }, [isFullScreen, reactFlowInstance, loading]);

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
    if (loading || isRegistryLoading) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-800 bg-opacity-50 text-white">
          <div className="text-center">
            <div className="mb-2">Loading validator diagram...</div>
            <div className="text-sm text-gray-300">This may take a moment</div>
          </div>
        </div>
      );
    }

    // Check if the validator exists
    const validatorExists =
      registryData?.systems[system]?.validators[validatorId];

    if (!validatorExists) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-800 bg-opacity-50 text-white">
          <div className="text-center">
            <div className="mb-2">Validator not found</div>
            <div className="text-sm text-gray-300">
              Could not find validator {validatorId} in system {system}
            </div>
          </div>
        </div>
      );
    }

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
        <Panel
          position="bottom-left"
          className="bg-gray-800 text-gray-200 p-2 shadow-2xl"
        >
          <div className="font-bold">
            {registryData?.systems[system]?.validators[validatorId]?.name}
          </div>
          <div className="text-sm">System: {system}</div>
        </Panel>
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
      </ReactFlow>
    );
  };

  return (
    <div
      className={`${isFullScreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : "w-full"} ${isFullScreen ? "h-screen" : "h-[600px]"} transition-all duration-300`}
    >
      <ReactFlowProvider>{renderDiagram()}</ReactFlowProvider>
    </div>
  );
}
