import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { LinkItemType } from "fumadocs-ui/layouts/links";
import { RootToggle } from "fumadocs-ui/components/layout/root-toggle";
import { getSidebarTabs } from "fumadocs-ui/utils/get-sidebar-tabs";
import { AppWindow, Github, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { SidebarFolderNode, SidebarSeparatorNode } from "@/components/sidebar-folder";
import { source } from "@/lib/source";

// Three sidebar roots (Andamio Issuer, Andamio API, Protocol) are `root: true`
// folders in content/docs, switched with the stock root toggle. Inside a root
// the sidebar shows only that root's tree, so each root's meta.json ends with a
// bare "---" divider and links to Home and Glossary. Developer community stays
// in the root sidebar only, unfeatured while it is unsupported. The icon links
// below render in the sidebar footer. They live here, not in baseOptions.links,
// because baseOptions also feeds the `/` navbar.
const docsLinks: LinkItemType[] = [
  {
    type: "icon",
    text: "Andamio App",
    label: "Andamio App",
    url: "https://mainnet.app.andamio.io",
    icon: <AppWindow />,
    external: true,
  },
  {
    type: "icon",
    text: "andamio.io",
    label: "andamio.io",
    url: "https://andamio.io",
    icon: <Globe />,
    external: true,
  },
  {
    type: "icon",
    text: "GitHub",
    label: "GitHub",
    url: "https://github.com/Andamio-Platform",
    icon: <Github />,
    external: true,
  },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      links={docsLinks}
      // Fumadocs renders the root toggle above search. Turn the built-in one
      // off and render it in the banner slot, which comes after search.
      sidebar={{
        tabs: false,
        banner: (
          <RootToggle
            options={getSidebarTabs(source.pageTree)}
            className="mt-2 mb-1 w-full border border-fd-border p-2 transition-colors hover:bg-fd-accent/50"
          />
        ),
        components: { Folder: SidebarFolderNode, Separator: SidebarSeparatorNode },
      }}
    >
      {children}
    </DocsLayout>
  );
}
