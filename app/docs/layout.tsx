import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { LinkItemType } from "fumadocs-ui/layouts/links";
import { getSidebarTabs } from "fumadocs-ui/utils/get-sidebar-tabs";
import type { PageTree } from "fumadocs-core/server";
import { AppWindow, createLucideIcon, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { ProductToggle } from "@/components/product-toggle";
import { SidebarFolderNode, SidebarSeparatorNode } from "@/components/sidebar-folder";
import { source } from "@/lib/source";

// lucide-react 1 dropped brand icons; this is its last GitHub mark (ISC).
const Github = createLucideIcon("Github", [
  [
    "path",
    {
      d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
      key: "tonef",
    },
  ],
  ["path", { d: "M9 18c-4.51 2-5-2-7-2", key: "9comsn" }],
]);

// Three sidebar roots (Andamio Issuer, Andamio API, Protocol) are `root: true`
// folders in content/docs, switched with the stock root toggle. Inside a root
// the sidebar shows only that root's tree, so each root's meta.json ends with a
// bare "---" divider and links to Home and Glossary. Developer community stays
// in the root sidebar only, unfeatured while it is unsupported. The icon links
// below render in the sidebar footer.
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

// Pages outside the three product folders (the /docs home, Glossary,
// Developer community). Each product's meta.json links Home and Glossary, so
// they would otherwise count as part of every product and show the picker.
function sharedUrls(nodes: PageTree.Node[], out = new Set<string>()): Set<string> {
  for (const node of nodes) {
    if (node.type === "page") out.add(node.url);
    if (node.type === "folder" && !node.root) {
      if (node.index) out.add(node.index.url);
      sharedUrls(node.children, out);
    }
  }
  return out;
}

const shared = sharedUrls(source.pageTree.children);
const productOptions = getSidebarTabs(source.pageTree).map((option) => ({
  ...option,
  urls: option.urls && new Set([...option.urls].filter((url) => !shared.has(url))),
}));

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
          <ProductToggle
            options={productOptions}
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
