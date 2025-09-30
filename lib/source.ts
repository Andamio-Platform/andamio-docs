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
    // @ts-expect-error - Type mismatch between fumadocs-openapi and fumadocs-core
    attachFile,
  },
  icon(icon) {
    if (!icon) {
      return;
    }

    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
});

export const openapi = createOpenAPI({
  // Proxy requests to the Andamio API Gateway
  // Users need to authenticate via:
  // 1. Register: /auth/register
  // 2. Login: /auth/login (get JWT token)
  // 3. Request API Key: /apikey/request (with Bearer token)
  // 4. Use both Bearer token and API key in requests
  // Note: Base URL is handled by the proxy route
  proxyUrl: "/api/proxy",
});
