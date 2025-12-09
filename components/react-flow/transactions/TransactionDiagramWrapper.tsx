"use client";

import { useEffect, useState } from "react";
import TxDiagram from "./DiagramTransactionFlow";
import { TransactionYaml } from "@/types";

export default function TransactionDiagramWrapper({
  txFilePath,
  version = "v1",
}: {
  txFilePath: string;
  version?: string;
}) {
  const [txData, setTxData] = useState<TransactionYaml | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        console.log("Fetching transaction data for:", txFilePath, "version:", version);

        // Use V2 API for v2 transactions, V1 API otherwise
        const apiEndpoint = version === "v2"
          ? `/api/transaction-v2?file=${encodeURIComponent(txFilePath)}&format=v1`
          : `/api/transaction?file=${encodeURIComponent(txFilePath)}&version=${version}`;

        const response = await fetch(apiEndpoint);
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch transaction data: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Received transaction data:", data);

        // V2 API with format=v1 returns diagramData, V1 API returns data
        const txDataResult = version === "v2" ? data.diagramData : data.data;
        console.log("Extracted transaction data:", txDataResult);

        setTxData(txDataResult);
        setError(null);
      } catch (err) {
        console.error("Error fetching transaction data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [txFilePath, version]);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
        <div className="text-center">
          <div className="mb-2">Loading transaction diagram...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 border border-destructive/50 bg-destructive/10 rounded-md">
        <h3 className="font-medium mb-2">Error loading transaction diagram</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!txData) {
    return (
      <div className="w-full p-4 border border-warning/50 bg-warning/10 rounded-md">
        <h3 className="font-medium mb-2">No transaction data available</h3>
        <p className="text-sm text-muted-foreground">
          Could not load the transaction diagram
        </p>
      </div>
    );
  }

  return <TxDiagram txData={txData} version={version} />;
}
