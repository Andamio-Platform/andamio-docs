"use client";

import dynamic from 'next/dynamic';

// Import the diagram component with dynamic import to ensure client-side only rendering
const DiagramTest = dynamic(
  () => import('./DiagramTest'),
  { ssr: false } // This is allowed in a client component
);

export default function DiagramWrapper() {
  return <DiagramTest />;
}
