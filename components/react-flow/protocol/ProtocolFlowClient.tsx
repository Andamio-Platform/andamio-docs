"use client";

import dynamic from "next/dynamic";

// Dynamically import the ProtocolFlow component with no SSR
const ProtocolFlow = dynamic(() => import("./ProtocolFlow"), {
  ssr: false,
});

export default function ProtocolFlowClient() {
  return <ProtocolFlow />;
}
