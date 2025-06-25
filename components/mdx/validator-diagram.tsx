"use client";

import DiagramValidatorOverview from "@/components/react-flow/validators/DiagramValidatorOverview";
import SystemDiagram from "@/components/react-flow/validators/SystemDiagram";

interface ValidatorDiagramProps {
  system: string;
  validator?: string;
  title?: string;
  description?: string;
}

export function ValidatorDiagram({
  system,
  validator,
  title,
  description,
}: ValidatorDiagramProps) {
  return (
    <div className="my-8">
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      
      {validator ? (
        <DiagramValidatorOverview system={system} validatorId={validator} />
      ) : (
        <SystemDiagram system={system} />
      )}
    </div>
  );
}