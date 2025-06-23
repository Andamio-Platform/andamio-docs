"use client";

import * as React from "react";

export interface DemoCanvasWidgetProps {
  color?: string;
  background?: string;
  children?: React.ReactNode;
}

// Global styles to ensure proper diagram rendering
const globalStyles = `
  /* Ensure the diagram takes full height */
  html, body, #root {
    height: 100%;
  }

  /* Make sure the canvas widget takes full size */
  .srd-diagram {
    height: 100% !important;
    width: 100% !important;
    background-color: transparent !important;
    position: relative !important;
    z-index: 1 !important;
  }

  /* Make nodes more visible and match original styling */
  .srd-node {
    font-weight: bold;
    color: white;
    z-index: 10 !important;
    position: absolute !important;
  }

  .srd-node-layer {
    position: absolute !important;
    height: 100% !important;
    width: 100% !important;
    z-index: 2 !important;
    pointer-events: none;
  }

  .srd-node * {
    pointer-events: auto;
  }

  /* Style node ports */
  .srd-port {
    background: white !important;
    border: 2px solid #444 !important;
    width: 12px !important;
    height: 12px !important;
    z-index: 10 !important;
  }

  /* Style links between nodes */
  .srd-link-layer {
    position: absolute !important;
    height: 100% !important;
    width: 100% !important;
    z-index: 1 !important;
    transform-origin: 0 0 !important;
    overflow: visible !important;
    pointer-events: none;
  }

  .srd-link path {
    stroke-width: 2px !important;
    pointer-events: all;
  }
`;

export function DemoCanvasWidget(props: DemoCanvasWidgetProps) {
  const backgroundColor = props.background || "rgb(60, 60, 60)";
  const gridColor = props.color || "rgba(255,255,255, 0.05)";
  
  return (
    <>
      {/* Inject global styles for diagram components */}
      <style jsx global>{globalStyles}</style>
      
      {/* Container that mimics the original styled component */}
      <div 
        className="h-full w-full flex relative overflow-hidden"
        style={{
          backgroundColor,
          backgroundSize: "50px 50px",
          backgroundImage: `
            linear-gradient(
              0deg,
              transparent 24%,
              ${gridColor} 25%,
              ${gridColor} 26%,
              transparent 27%,
              transparent 74%,
              ${gridColor} 75%,
              ${gridColor} 76%,
              transparent 77%,
              transparent
            ),
            linear-gradient(
              90deg,
              transparent 24%,
              ${gridColor} 25%,
              ${gridColor} 26%,
              transparent 27%,
              transparent 74%,
              ${gridColor} 75%,
              ${gridColor} 76%,
              transparent 77%,
              transparent
            )
          `
        }}
      >
        {props.children}
      </div>
    </>
  );
}
