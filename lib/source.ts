import { allDocs, allMetas } from "content-collections";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "@fumadocs/content-collections";
import { icons } from "lucide-react";
import { createElement } from "react";
import { createOpenAPI, attachFile } from "fumadocs-openapi/server";

export const source = loader({
  baseUrl: "/docs",
  source: createMDXSource(allDocs, allMetas),
  pageTree: {
    // Adds a badge to each page item in page tree
    attachFile,
  },
  icon(icon) {
    if (!icon) {
      return;
    }

    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
});

export const openapi = createOpenAPI();
