"use client";

import dynamic from "next/dynamic";

// Dynamically import the LinearDiagram component with no SSR
const LinearDiagram = dynamic(() => import("./LinearDiagram"), {
  ssr: false,
});

interface LinearDiagramClientProps {
  initialDiagram?: string;
  showDropdown?: boolean;
}

export default function LinearDiagramClient({ 
  initialDiagram, 
  showDropdown = true 
}: LinearDiagramClientProps) {
  return <LinearDiagram initialDiagram={initialDiagram} showDropdown={showDropdown} />;
}