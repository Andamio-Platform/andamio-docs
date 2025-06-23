"use client";

import dynamic from "next/dynamic";

// Dynamically import the TransactionDiagramWrapper with no SSR
const TransactionDiagramWrapper = dynamic(
  () => import("./TransactionDiagramWrapper"),
  { ssr: false }
);

export default function TransactionDiagramClient({ txFilePath }: { txFilePath: string }) {
  return <TransactionDiagramWrapper txFilePath={txFilePath} />;
}
