"use client";

import ProtocolFlowClient from "@/components/react-flow/protocol/ProtocolFlowClient";

interface ProtocolDiagramProps {
  title?: string;
  description?: string;
}

export function ProtocolDiagram({
  title,
  description,
}: ProtocolDiagramProps) {
  return (
    <div className="my-8">
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      
      <ProtocolFlowClient />
    </div>
  );
}