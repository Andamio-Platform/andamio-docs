import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { LinkItemType } from "fumadocs-ui/layouts/links";
import { AppWindow, Github, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";

// Three sidebar roots (Andamio Issuer, Andamio API, Protocol) are `root: true`
// folders in content/docs, switched with the stock root toggle. Inside a root
// the sidebar shows only that root's tree, so the shared pages (Home, Glossary,
// Developer community) are reached through these links, which render above
// every sidebar. Icon links render in the sidebar footer. They live here, not
// in baseOptions.links, because baseOptions also feeds the `/` navbar.
const docsLinks: LinkItemType[] = [
  { text: "Home", url: "/docs" },
  { text: "Glossary", url: "/docs/glossary" },
  { text: "Developer community", url: "/docs/developer-community" },
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
    <DocsLayout tree={source.pageTree} {...baseOptions} links={docsLinks}>
      {children}
    </DocsLayout>
  );
}
