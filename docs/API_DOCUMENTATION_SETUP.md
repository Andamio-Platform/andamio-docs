# Andamio API Gateway Documentation Setup

This document explains how the interactive API documentation system works and what's needed to enable full functionality.

## Overview

The docs site pulls the Andamio API Gateway's OpenAPI schema and generates interactive documentation pages where users can:
- View complete endpoint specifications
- See request/response examples
- Test endpoints directly with their own credentials

## Architecture

```
User Browser → Docs Site (/api/proxy) → API Gateway
                ↑
                └─ OpenAPI Schema (defines endpoints)
```

### Components

1. **OpenAPI Schema** (`/public/data/andamio-api-gateway-openapi.json`)
   - Auto-generated from Swagger 2.0 schema
   - Contains all endpoint definitions, parameters, and responses
   - Includes server URL for making requests

2. **API Proxy** (`/app/api/proxy/route.ts`)
   - Forwards user requests to API Gateway
   - Handles authentication (Bearer token + API key)
   - Configured to allow `andamio-api-308006323670.us-central1.run.app`

3. **Generated Documentation** (`/content/docs/api/*`)
   - 136 MDX files organized by API category
   - Each renders an interactive endpoint page
   - Includes "Try it out" functionality

## How Users Test Endpoints

1. **Register** → Create account at `/auth/register`
2. **Login** → Get JWT token from `/auth/login`
3. **Authorize** → Click "Authorize" button, add `Bearer YOUR_JWT_TOKEN`
4. **Get API Key** → Request from `/apikey/request` endpoint
5. **Authorize Again** → Add `YOUR_API_KEY` to ApiKeyAuth field
6. **Test** → Use "Try it out" on any endpoint

## Interactive Testing Status

### ✅ Working!

The interactive API testing is now fully functional! Users can:
- Test endpoints directly in the documentation
- Use the "Try it out" feature on any endpoint page
- Authenticate with JWT tokens and API keys
- See live responses from the API Gateway

### How It Works

The fix involved ensuring the OpenAPI schema includes the `servers` field:

```json
{
  "servers": [
    {
      "url": "https://andamio-api-308006323670.us-central1.run.app/api/v1",
      "description": "Andamio API Gateway (Production)"
    }
  ]
}
```

This field tells the proxy where to forward requests. The conversion script (`scripts/generate-all-api-docs.mjs`) automatically adds this during the Swagger 2.0 → OpenAPI 3.0 conversion.

### CORS Configuration

The Andamio API Gateway has been configured to accept all incoming routes, so CORS is not an issue. The proxy successfully forwards requests from the docs site to the API Gateway.

## Updating Documentation

When the API Gateway schema changes:

```bash
# 1. Pull latest schema
curl -s https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/doc.json -o data/andamio-api-gateway.json

# 2. Generate documentation
npm run generate-all-api-docs

# 3. Organize into directories
node scripts/organize-api-docs.mjs
node scripts/add-tags-to-mdx.mjs

# 4. Build and deploy
npm run build
```

The scripts automatically:
- Convert Swagger 2.0 → OpenAPI 3.0
- **Add `servers` field** with API Gateway URL (critical for proxy to work!)
- Generate ~140 endpoint pages
- Organize by API tags into nested directories
- Add tags to MDX frontmatter
- Copy schema to `/public/data/` directory

## Files to Know

- **`CLAUDE.md`** - Complete technical documentation for Claude
- **`scripts/generate-all-api-docs.mjs`** - Generates MDX from schema
- **`scripts/organize-api-docs.mjs`** - Organizes files by tags
- **`lib/source.ts`** - OpenAPI integration config
- **`app/api/proxy/route.ts`** - Proxy request handler
- **`content/docs/api/index.mdx`** - User-facing authentication guide

## Key Takeaways

1. **The `servers` field is critical** - Without it, the proxy doesn't know where to send requests
2. **Always run organize scripts** - After generating docs, run `organize-api-docs.mjs` and `add-tags-to-mdx.mjs`
3. **CORS is configured** - The API Gateway accepts all incoming routes
4. **Interactive testing works** - Users can test endpoints directly in the docs

## Questions?

- Technical setup details: See `CLAUDE.md`
- API Gateway source: https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/doc.json
- Live Swagger UI: https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/index.html