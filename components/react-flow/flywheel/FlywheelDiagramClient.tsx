"use client";

import dynamic from "next/dynamic";

// Dynamically import the FlywheelDiagram component with no SSR
const FlywheelDiagram = dynamic(() => import("./FlywheelDiagram"), {
  ssr: false,
});

interface FlywheelDiagramClientProps {
  initialDiagram?: string;
  showDropdown?: boolean;
}

export default function FlywheelDiagramClient({ 
  initialDiagram, 
  showDropdown = true 
}: FlywheelDiagramClientProps) {
  return <FlywheelDiagram initialDiagram={initialDiagram} showDropdown={showDropdown} />;
}