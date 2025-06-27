"use client";

import LinearDiagramClient from "@/components/react-flow/flywheel/LinearDiagramClient";

interface LinearDiagramProps {
  title?: string;
  description?: string;
  initialDiagram?: string;
  showDropdown?: boolean;
}

export function LinearDiagram({
  title,
  description,
  initialDiagram,
  showDropdown = true,
}: LinearDiagramProps) {
  return (
    <div className="my-8">
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      
      <LinearDiagramClient 
        initialDiagram={initialDiagram} 
        showDropdown={showDropdown} 
      />
    </div>
  );
}