import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { LinkItemType } from "fumadocs-ui/layouts/links";
import { getSidebarTabs } from "fumadocs-ui/utils/get-sidebar-tabs";
import type { PageTree } from "fumadocs-core/server";
import { AppWindow, Github, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { ProductToggle } from "@/components/product-toggle";
import { SidebarFolderNode, SidebarSeparatorNode } from "@/components/sidebar-folder";
import { source } from "@/lib/source";

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
