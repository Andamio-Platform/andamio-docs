"use client";

import type { PageTree } from "fumadocs-core/server";
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarSeparator,
} from "fumadocs-ui/components/layout/sidebar";
import { useTreePath } from "fumadocs-ui/provider";
import type { ReactNode } from "react";

/* First page in a folder, depth first. A group-folder root such as
   (developer) or (protocol) has no index, so it opens on its first page,
   the same target the root toggle uses. */
function firstPageUrl(folder: PageTree.Folder): string | undefined {
  if (folder.index) return folder.index.url;
  for (const child of folder.children) {
    if (child.type === "page" && !child.external) return child.url;
    if (child.type === "folder") {
      const url = firstPageUrl(child);
      if (url) return url;
    }
  }
  return undefined;
}

/* Sidebar folder renderer. A root folder (Andamio Issuer, Andamio API,
   Protocol) renders as a plain link to its landing page, so clicking it switches
   straight to that root's sidebar instead of first opening an accordion.
   Every other folder keeps the stock collapsible behavior. */
export function SidebarFolderNode({
  item,
  children,
}: {
  item: PageTree.Folder;
  level: number;
  children: ReactNode;
}) {
  const path = useTreePath();
  const rootUrl = item.root ? (item.index?.url ?? firstPageUrl(item)) : undefined;

  if (rootUrl) {
    return (
      <SidebarItem href={rootUrl} icon={item.icon}>
        {item.name}
      </SidebarItem>
    );
  }

  return (
    <SidebarFolder defaultOpen={item.defaultOpen ?? path.includes(item)}>
      {item.index ? (
        <SidebarFolderLink href={item.index.url} external={item.index.external}>
          {item.icon}
          {item.name}
        </SidebarFolderLink>
      ) : (
        <SidebarFolderTrigger>
          {item.icon}
          {item.name}
        </SidebarFolderTrigger>
      )}
      <SidebarFolderContent>{children}</SidebarFolderContent>
    </SidebarFolder>
  );
}

/* Sidebar separator renderer. A bare "---" in meta.json (no title) draws a
   thin rule; each product root uses one to set Home and Glossary apart below
   its own pages. Titled separators keep the stock look. */
export function SidebarSeparatorNode({ item }: { item: PageTree.Separator }) {
  if (!item.name) {
    return <hr className="mx-2 my-3 border-fd-border" />;
  }
  return (
    <SidebarSeparator className="mt-6 first:mt-0">
      {item.icon}
      {item.name}
    </SidebarSeparator>
  );
}
