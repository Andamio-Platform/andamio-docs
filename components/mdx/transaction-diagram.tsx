"use client";

import TransactionDiagramWrapper from "@/components/react-flow/transactions/TransactionDiagramWrapper";

interface TransactionDiagramProps {
  txFile: string;
  title?: string;
  description?: string;
}

export function TransactionDiagram({
  txFile,
  title,
  description,
}: TransactionDiagramProps) {
  return (
    <div className="my-8">
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      
      <TransactionDiagramWrapper txFilePath={txFile} />
    </div>
  );
}