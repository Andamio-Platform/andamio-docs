"use client";

import { useState, useEffect } from "react";
import { DemoCanvasWidget } from "./DemoCanvasWidget";
import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultLinkModel,
  DiagramEngine,
} from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";

// Define types for the engine to fix TypeScript errors

// Client-side only diagram component to avoid hydration mismatches
export default function DiagramTest() {
  const [engine, setEngine] = useState<DiagramEngine | null>(null);
  const [loading, setLoading] = useState(true);

  // Only render the diagram on the client side
  useEffect(() => {
    // This code only runs in the browser, after hydration
    const initDiagram = async () => {
      try {
        console.log("Initializing diagram...");

        console.log("Libraries imported successfully");

        // Create the diagram engine and model
        const diagramEngine = createEngine();
        const model = new DiagramModel();

        // Create nodes with positions
        const node1 = new DefaultNodeModel({
          name: "Node 1",
          color: "rgb(0,192,255)",
        });
        node1.setPosition(100, 100);

        // Add ports to node1
        const outPort1 = node1.addOutPort("Out");

        const node2 = new DefaultNodeModel({
          name: "Node 2",
          color: "rgb(192,255,0)",
        });
        node2.setPosition(400, 100);

        // Add ports to node2
        const inPort2 = node2.addInPort("In");

        console.log("Created nodes:", node1, node2);

        // Create a link between the nodes
        const link = new DefaultLinkModel();
        link.setSourcePort(outPort1);
        link.setTargetPort(inPort2);

        // Add all elements to the model
        model.addAll(node1, node2, link);

        // Set the model to the engine
        diagramEngine.setModel(model);

        console.log("Model configured, setting engine");
        setEngine(diagramEngine);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing diagram:", error);
        setLoading(false);
      }
    };

    initDiagram();
  }, []);

  // Render the diagram
  const renderDiagram = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-800 bg-opacity-50 text-white">
          <div className="text-center">
            <div className="mb-2">Loading diagram...</div>
            <div className="text-sm text-gray-300">This may take a moment</div>
          </div>
        </div>
      );
    }

    if (!engine || !CanvasWidget) {
      return (
        <div className="flex items-center justify-center h-full bg-red-800 bg-opacity-50 text-white">
          <div className="text-center">
            <div className="mb-2">Failed to load diagram</div>
            <div className="text-sm text-gray-300">
              Check console for errors
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full" style={{ position: "relative" }}>
        <CanvasWidget engine={engine} className="w-full h-full" />
      </div>
    );
  };

  return <DemoCanvasWidget>{renderDiagram()}</DemoCanvasWidget>;
}
