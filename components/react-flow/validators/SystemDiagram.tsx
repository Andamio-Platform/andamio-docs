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
import SystemNode from "./nodes/SystemNode";

// Import types
import { Registry, RedeemerAction } from "@/types";

// Define node types for React Flow
const nodeTypes = {
  validatorNode: ValidatorNode,
  redeemerNode: RedeemerNode,
  systemNode: SystemNode,
};

export default function SystemDiagram({ system }: { system: string }) {
  return <SystemDiagramOverview system={system} />;
}

// Client-side only diagram component to avoid hydration mismatches
function SystemDiagramOverview({ system }: { system: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  console.log(system);

  // State for registry data
  const [registryData, setRegistryData] = useState<Registry | null>(null);
  const [isRegistryLoading, setIsRegistryLoading] = useState(true);

  // Fetch registry data
  useEffect(() => {
    const fetchRegistryData = async () => {
      try {
        const response = await fetch("/yaml/validator-registry-v1.yaml");
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

  // Initialize the diagram with system data
  useEffect(() => {
    const initDiagram = async () => {
      if (isRegistryLoading || !registryData) return;

      try {
        console.log("Initializing system diagram for:", system);

        const diagramNodes: Node[] = [];
        const diagramEdges: Edge[] = [];

        // Find the system in the registry
        const systemData = registryData.systems[system];

        if (!systemData) {
          console.error(`System ${system} not found in registry`);
          setLoading(false);
          return;
        }

        console.log(`System data for ${system}:`, systemData);

        // Create system node at the center
        const systemNode: Node = {
          id: "system-node",
          type: "systemNode",
          position: { x: 300, y: 300 },
          data: {
            name:
              system.charAt(0).toUpperCase() +
              system.slice(1).replace("-", " "),
            system: system,
          },
        };
        diagramNodes.push(systemNode);

        // Process validators
        const validators = systemData.validators || {};
        const validatorKeys = Object.keys(validators);

        // Calculate redeemer count for each validator to determine dynamic spacing
        const validatorRedeemerCounts = validatorKeys.map((validatorId) => {
          const validator = validators[validatorId];
          const redeemerData = validator.redeemer;

          if (!redeemerData) return 0;

          const redeemers = Array.isArray(redeemerData)
            ? redeemerData
            : [redeemerData];
          let totalRedeemers = 0;

          redeemers.forEach((redeemer) => {
            if (!redeemer || Object.keys(redeemer).length === 0) return;

            if (redeemer.type === "bytes" || !redeemer.type) {
              totalRedeemers += 1;
            } else {
              const actionKey = Object.keys(redeemer).find(
                (key) => key !== "type"
              );
              if (actionKey) {
                const actions = Array.isArray(redeemer[actionKey])
                  ? redeemer[actionKey]
                  : [redeemer[actionKey]];
                totalRedeemers += actions.length;
              }
            }
          });

          return Math.max(totalRedeemers, 1); // Minimum 1 for spacing calculation
        });

        // Calculate dynamic spacing based on redeemer counts
        const systemY = 300;
        const validatorX = 600; // All validators in center column
        const baseValidatorSpacing = 80; // Base minimum spacing between validators
        const redeemerSpacing = 60; // Space per redeemer

        // Calculate cumulative Y positions for validators
        const validatorPositions: number[] = [];
        let currentY = systemY;

        // Center the entire diagram vertically
        const totalHeight = validatorRedeemerCounts.reduce((sum, count) => {
          return sum + baseValidatorSpacing + count * redeemerSpacing;
        }, 0);
        currentY = systemY - totalHeight / 2;

        validatorKeys.forEach((validatorId, validatorIndex) => {
          const redeemerCount = validatorRedeemerCounts[validatorIndex];

          // Position this validator
          validatorPositions.push(currentY);

          // Move to next validator position (current + base spacing + space for redeemers)
          currentY += baseValidatorSpacing + redeemerCount * redeemerSpacing;
        });

        validatorKeys.forEach((validatorId, validatorIndex) => {
          const validator = validators[validatorId];

          // Use pre-calculated validator position
          const validatorY = validatorPositions[validatorIndex];

          // Create validator node
          const validatorNode: Node = {
            id: `validator-${validatorId}`,
            type: "validatorNode",
            position: { x: validatorX, y: validatorY },
            data: {
              name: validator.name,
              purpose: Array.isArray(validator.purpose)
                ? validator.purpose.join(", ")
                : validator.purpose,
              system: system,
              id: validatorId, // Pass the validator ID for linking
            },
          };
          diagramNodes.push(validatorNode);

          // Create edge from system to validator
          const systemToValidatorEdge: Edge = {
            id: `edge-system-to-validator-${validatorId}`,
            source: "system-node",
            target: `validator-${validatorId}`,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          };
          diagramEdges.push(systemToValidatorEdge);

          // Process redeemers for this validator
          const redeemerData = validator.redeemer;

          if (redeemerData) {
            const redeemers = Array.isArray(redeemerData)
              ? redeemerData
              : [redeemerData];

            // Calculate all redeemer nodes for this validator first
            const validatorRedeemers: Array<{
              id: string;
              type: string;
              action?: string;
              transaction: string;
            }> = [];

            redeemers.forEach((redeemer, redeemerIndex) => {
              // Skip empty redeemer objects
              if (!redeemer || Object.keys(redeemer).length === 0) {
                return;
              }

              if (redeemer.type === "bytes" || !redeemer.type) {
                // Simple redeemer type
                validatorRedeemers.push({
                  id: `redeemer-${validatorId}-${redeemerIndex}`,
                  type: redeemer.type || "bytes",
                  transaction: Array.isArray(redeemer.transaction)
                    ? redeemer.transaction.join(", ")
                    : redeemer.transaction || "",
                });
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
                      action:
                        | RedeemerAction
                        | Record<string, string | string[]>,
                      actionIndex: number
                    ) => {
                      // Handle different action structures
                      const actionName = Array.isArray(action.action)
                        ? action.action.join(", ")
                        : action.action || actionKey;
                      const transaction = Array.isArray(action.transaction)
                        ? action.transaction.join(", ")
                        : action.transaction || "";

                      validatorRedeemers.push({
                        id: `redeemer-${validatorId}-${redeemerIndex}-${actionIndex}`,
                        type: redeemer.type || actionKey,
                        action: actionName,
                        transaction: transaction,
                      });
                    }
                  );
                }
              }
            });

            // Now position all redeemers for this validator with equal spacing
            const redeemerX = 1000; // All redeemers in right column
            const totalRedeemerCount = validatorRedeemers.length;

            // Calculate starting Y position for redeemers (centered around validator)
            const redeemerStartY =
              validatorY - ((totalRedeemerCount - 1) * redeemerSpacing) / 2;

            validatorRedeemers.forEach((redeemerData, redeemerIndex) => {
              const redeemerY =
                redeemerStartY + redeemerIndex * redeemerSpacing;

              const redeemerNode: Node = {
                id: redeemerData.id,
                type: "redeemerNode",
                position: { x: redeemerX, y: redeemerY },
                data: {
                  type: redeemerData.type,
                  action: redeemerData.action,
                  transaction: redeemerData.transaction,
                },
              };
              diagramNodes.push(redeemerNode);

              // Create edge from validator to redeemer
              const edge: Edge = {
                id: `edge-validator-to-${redeemerData.id}`,
                source: `validator-${validatorId}`,
                target: redeemerData.id,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              };
              diagramEdges.push(edge);
            });
          }
        });

        // Set the nodes and edges
        setNodes(diagramNodes);
        setEdges(diagramEdges);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing system diagram:", error);
        setLoading(false);
      }
    };

    initDiagram();
  }, [registryData, isRegistryLoading, system, setNodes, setEdges]);

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
            <div className="mb-2">Loading system diagram...</div>
            <div className="text-sm text-gray-300">This may take a moment</div>
          </div>
        </div>
      );
    }

    // Check if the system exists
    const systemExists = registryData?.systems[system];

    if (!systemExists) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-800 bg-opacity-50 text-white">
          <div className="text-center">
            <div className="mb-2">System not found</div>
            <div className="text-sm text-gray-300">
              Could not find system {system} in registry
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
            {system.charAt(0).toUpperCase() + system.slice(1).replace("-", " ")}{" "}
            System
          </div>
          <div className="text-sm">
            {Object.keys(registryData?.systems[system].validators || {}).length}{" "}
            validators
          </div>
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
