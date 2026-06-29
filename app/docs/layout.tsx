import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      // Auto-derive the root toggle from every `root: true` folder in the tree.
      // An empty options object routes to getSidebarTabs(tree), which walks the
      // tree and computes each tab's `urls` set — so a new product root appears
      // in the toggle without hand-editing this array. (The type rejects `true`;
      // `{}` is the GetSidebarTabsOptions auto-derive form.) Tree scoping itself
      // comes from TreeContext.findLast(root) — see the governance mechanism note.
      sidebar={{ tabs: {} }}
    >
      {children}
    </DocsLayout>
  );
}
