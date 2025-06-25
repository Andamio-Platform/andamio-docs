"use client";

import FlywheelDiagramClient from "@/components/react-flow/flywheel/FlywheelDiagramClient";

interface FlywheelDiagramProps {
  title?: string;
  description?: string;
}

export function FlywheelDiagram({
  title,
  description,
}: FlywheelDiagramProps) {
  return (
    <div className="my-8">
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      
      <FlywheelDiagramClient />
    </div>
  );
}