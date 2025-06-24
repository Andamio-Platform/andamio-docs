"use client";

import { useParams } from "next/navigation";
import DiagramValidatorOverview from "@/components/react-flow/validators/DiagramValidatorOverview";

export default function ValidatorPage() {
  const params = useParams();
  const system = params.system as string;
  const validatorId = params.validatorId as string;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Validator: {validatorId}</h1>
      <div className="border rounded-lg overflow-hidden">
        <DiagramValidatorOverview system={system} validatorId={validatorId} />
      </div>
    </div>
  );
}
