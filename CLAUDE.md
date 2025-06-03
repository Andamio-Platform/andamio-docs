# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbo (http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run generate-api-docs` - Generate API documentation from OpenAPI schema

## Architecture Overview

This is a Next.js documentation site built with Fumadocs, using content collections for MDX content management.

### Content Management
- **Content Collections**: Uses `@content-collections/core` to manage MDX files in `content/docs/`
- **Document Structure**: Two collections defined in `content-collections.ts`:
  - `docs`: All `.mdx` files for documentation content
  - `meta`: `meta.json` files for navigation and metadata
- **Content Source**: `lib/source.ts` provides the content adapter with OpenAPI integration

### Key Components
- **Layout Configuration**: `app/layout.config.tsx` contains shared layout options including navigation title with Andamio logo
- **OpenAPI Integration**: Uses fumadocs-openapi for API documentation generation from `data/express-openapi.yaml`
- **API Docs Generation**: `scripts/generate-api-docs.mjs` generates MDX files from OpenAPI schema into `content/docs/apis/reference/`

### Route Structure
- `app/(home)/` - Landing page and home routes
- `app/docs/` - Documentation layout and pages
- `app/api/search/` - Search functionality
- `app/api/proxy/` - OpenAPI proxy for API documentation

### Content Organization
- Protocol documentation in `content/docs/protocol/`
- API reference in `content/docs/apis/reference/` (auto-generated)
- Transaction documentation in `content/docs/transactions/`
- Whitepaper content in `content/docs/whitepaper/`

### Special Features
- Mermaid diagram support via `components/mdx/mermaid.tsx`
- OpenAPI documentation integration with proxy endpoint
- Content collections with MDX transformation and meta schema validation