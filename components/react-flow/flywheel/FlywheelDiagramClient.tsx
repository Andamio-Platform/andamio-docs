"use client";

import dynamic from "next/dynamic";

// Dynamically import the FlywheelDiagram component with no SSR
const FlywheelDiagram = dynamic(() => import("./FlywheelDiagram"), {
  ssr: false,
});

export default function FlywheelDiagramClient() {
  return <FlywheelDiagram />;
}