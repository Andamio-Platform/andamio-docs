import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      sidebar={{
        tabs: [
          { title: "Documentation", url: "/docs" },
          {
            title: "Protocol",
            description: "On-chain internals · advanced",
            url: "/docs/protocol",
          },
        ],
      }}
    >
      {children}
    </DocsLayout>
  );
}
