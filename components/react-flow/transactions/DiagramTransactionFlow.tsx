"use client";

import { useState, useEffect, useCallback } from "react";
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

// Custom node components
import TransactionNode from "./nodes/TransactionNode";
import InputNode from "./nodes/InputNode";
import OutputNode from "./nodes/OutputNode";
import ReferenceInputNode from "./nodes/ReferenceInputNode";
import { TransactionYaml, Registry } from "@/types";
import yaml from "js-yaml";

// Props interface for the component
interface DiagramTransactionFlowProps {
  txData: TransactionYaml;
  registryData?: Registry | null;
  version?: string;
}

// Define custom node types
const nodeTypes: NodeTypes = {
  transactionNode: TransactionNode,
  inputNode: InputNode,
  outputNode: OutputNode,
  referenceInputNode: ReferenceInputNode,
};

export default function TxDiagram({
  txData,
  version = "v1",
}: {
  txData: TransactionYaml;
  version?: string;
}) {
  return <DiagramTransactionFlow txData={txData} version={version} />;
}

// Client-side only diagram component to avoid hydration mismatches
function DiagramTransactionFlow({
  txData,
  registryData,
  version = "v1",
}: DiagramTransactionFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [internalRegistryData, setInternalRegistryData] =
    useState<Registry | null>(registryData || null);
  const [isRegistryLoading, setIsRegistryLoading] = useState(!registryData);

  // Fetch registry data if not provided
  useEffect(() => {
    const fetchRegistryData = async () => {
      if (internalRegistryData) {
        setIsRegistryLoading(false);
        return;
      }

      try {
        const response = await fetch("/yaml/validator-registry-v2.yaml");
        const yamlText = await response.text();
        const data = yaml.load(yamlText) as Registry;
        setInternalRegistryData(data);
        setIsRegistryLoading(false);
      } catch (error) {
        console.error("Error loading registry data:", error);
        setIsRegistryLoading(false);
      }
    };

    fetchRegistryData();
  }, [internalRegistryData]);

  // Initialize the diagram with transaction data
  useEffect(() => {
    const initDiagram = async () => {
      if (isRegistryLoading || !txData || !txData.metadata) {
        return;
      }

      try {
        const diagramNodes: Node[] = [];
        const diagramEdges: Edge[] = [];

        // Prepare mints and withdrawals data for the transaction node
        const mintsData =
          txData.mints?.map((mint) => ({
            id: mint.id,
            tokens: mint.tokens,
            policy: mint.policy,
            redeemer: mint.redeemer,
          })) || [];

        const withdrawalsData =
          txData.withdraws?.map((withdraw) => ({
            id: withdraw.id,
            amount: withdraw.amount,
            observer: withdraw.observer,
            redeemer: withdraw.redeemer,
          })) || [];

        // Estimate node heights based on content complexity
        // Using any type here is necessary due to the complex structure of transaction data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const estimateNodeHeight = (node: any) => {
          if (!node || !node.output) return 200; // Default height if structure is unexpected
          let baseHeight = 180; // Base height for a node

          // Add height for datum if present
          if (node.output?.datum) {
            const datumStr =
              typeof node.output.datum === "string"
                ? node.output.datum
                : JSON.stringify(node.output.datum);
            const datumLines = datumStr.split("\n").length;
            baseHeight += Math.min(datumLines * 20, 200); // Cap at 200px for datum
          }

          // Add height for values
          if (node.output?.value && Array.isArray(node.output.value)) {
            baseHeight += node.output.value.length * 25;
          }

          return baseHeight;
        };

        // Calculate estimated heights and positions
        const inputHeights: number[] = (txData.inputs || []).map(
          estimateNodeHeight
        );
        const refInputHeights: number[] = txData.reference_inputs
          ? txData.reference_inputs.map(estimateNodeHeight)
          : [];
        const outputHeights: number[] = (txData.outputs || []).map(
          estimateNodeHeight
        );

        // Calculate minimum spacing needed between nodes
        const minSpacing = 40; // Minimum gap between nodes

        // Calculate positions for each node type
        const inputPositions: number[] = [];
        let currentY = 100;
        for (let i = 0; i < inputHeights.length; i++) {
          inputPositions.push(currentY);
          currentY += inputHeights[i] + minSpacing;
        }

        const refInputPositions: number[] = [];
        for (let i = 0; i < refInputHeights.length; i++) {
          refInputPositions.push(currentY);
          currentY += refInputHeights[i] + minSpacing;
        }

        const outputPositions: number[] = [];
        currentY = 100;
        for (let i = 0; i < outputHeights.length; i++) {
          outputPositions.push(currentY);
          currentY += outputHeights[i] + minSpacing;
        }

        // Adjust transaction node position based on diagram size
        const diagramHeight = Math.max(
          currentY, // Input side height
          outputPositions.length > 0
            ? outputPositions[outputPositions.length - 1] +
                outputHeights[outputHeights.length - 1]
            : 200
        );

        // Center the transaction node vertically if the diagram is tall
        const txNodeY =
          diagramHeight > 500 ? Math.min(diagramHeight / 4, 150) : 80;

        // Calculate transaction node width based on content
        // Base width for transaction name and basic info
        const estimatedTxNodeWidth = 200 + txData.name.length * 8;

        // Calculate output node x position based on tx node width
        const txNodeX = 435;
        const outputNodeX = txNodeX + estimatedTxNodeWidth + 50; // 50px spacing

        // Create transaction node with mints and withdrawals
        const txNode: Node = {
          id: "transaction-node",
          type: "transactionNode",
          position: { x: txNodeX, y: txNodeY },
          data: {
            name: txData.name,
            fee: txData.metadata.estimated_fee,
            type: txData.metadata.category,
            version: version,
            role: txData.metadata.role,
            mints: mintsData,
            withdrawals: withdrawalsData,
            registryData: internalRegistryData,
          },
        };
        diagramNodes.push(txNode);

        // Process regular inputs
        (txData.inputs || []).forEach((input, index) => {

          const inputNode: Node = {
            id: `input-node-${input.id}-${index}`,
            type: "inputNode",
            position: { x: 0, y: inputPositions[index] },
            data: {
              id: input.id,
              address: input.output.address,
              value: input.output.value,
              version: version,
              type: input.type,
              redeemer: input.redeemer
                ? typeof input.redeemer === "string"
                  ? input.redeemer
                  : JSON.stringify(input.redeemer)
                : undefined,
              datum: input.output.datum
                ? typeof input.output.datum === "string"
                  ? input.output.datum
                  : JSON.stringify(input.output.datum)
                : undefined,
              script: input.output.script,
              registryData: internalRegistryData,
            },
          };
          diagramNodes.push(inputNode);

          // Create edge from input to transaction
          const edge: Edge = {
            id: `edge-input-${input.id}-to-tx-${index}`,
            source: `input-node-${input.id}-${index}`,
            target: "transaction-node",
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          };
          diagramEdges.push(edge);
        });

        // Process reference inputs if present
        if (txData.reference_inputs && txData.reference_inputs.length > 0) {
          txData.reference_inputs.forEach((refInput, index) => {
            const refInputNode: Node = {
              id: `ref-input-node-${refInput.id}-${index}`,
              type: "referenceInputNode",
              position: {
                x: 0,
                y: refInputPositions[index],
              },
              data: {
                id: refInput.id,
                address: refInput.output.address,
                value: refInput.output.value,
                version: version,
                type: refInput.type,
                datum: refInput.output.datum
                  ? typeof refInput.output.datum === "string"
                    ? refInput.output.datum
                    : JSON.stringify(refInput.output.datum)
                  : undefined,
                script: refInput.output.script,
                registryData: internalRegistryData,
              },
            };
            diagramNodes.push(refInputNode);

            // Create dashed edge for reference inputs
            const refEdge: Edge = {
              id: `edge-ref-input-${refInput.id}-to-tx-${index}`,
              source: `ref-input-node-${refInput.id}-${index}`,
              target: "transaction-node",
              style: { strokeDasharray: "5 5" },
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            };
            diagramEdges.push(refEdge);
          });
        }

        // Process outputs
        (txData.outputs || []).forEach((output, index) => {

          const outputNode: Node = {
            id: `output-node-${output.id}-${index}`,
            type: "outputNode",
            position: { x: outputNodeX, y: outputPositions[index] },
            data: {
              id: output.id,
              address: output.output.address,
              value: output.output.value,
              version: version,
              type: output.type,
              datum: output.output.datum
                ? typeof output.output.datum === "string"
                  ? output.output.datum
                  : JSON.stringify(output.output.datum)
                : undefined,
              script: output.output.script,
              registryData: internalRegistryData,
            },
          };
          diagramNodes.push(outputNode);

          // Create edge from transaction to output
          const edge: Edge = {
            id: `edge-tx-to-output-${output.id}-${index}`,
            source: "transaction-node",
            target: `output-node-${output.id}-${index}`,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          };
          diagramEdges.push(edge);
        });

        // Mints are now handled directly in the transaction node

        // Withdrawals are now handled directly in the transaction node

        // Set the nodes and edges
        setNodes(diagramNodes);
        setEdges(diagramEdges);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing diagram:", error);
        setLoading(false);
      }
    };

    initDiagram();
  }, [
    txData,
    setNodes,
    setEdges,
    internalRegistryData,
    isRegistryLoading,
    version,
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
    if (loading || isRegistryLoading || !txData || !txData.metadata) {
      return (
        <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
          <div className="text-center">
            <div className="mb-2">Loading diagram...</div>
            <div className="text-sm opacity-70">This may take a moment</div>
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
          className="bg-card text-card-foreground p-2 shadow-2xl rounded"
        >
          <div className="font-bold">{txData.name}</div>
          <div className="text-sm">{txData.metadata.description}</div>
        </Panel>
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
      className={`${isFullScreen ? "fixed inset-0 z-50 bg-background" : "w-full"} ${isFullScreen ? "h-screen" : "h-[800px]"} transition-all duration-300`}
    >
      <ReactFlowProvider>{renderDiagram()}</ReactFlowProvider>
    </div>
  );
}
