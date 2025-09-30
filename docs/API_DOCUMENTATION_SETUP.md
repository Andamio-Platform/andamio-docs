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

## Current Limitation: CORS

### The Problem

When running locally or on a new domain, the API Gateway blocks requests:

```
[Proxy] The origin "http://localhost:3000" is not allowed.
```

This happens because:
- The browser sends the request origin in headers
- The API Gateway checks the origin against its allowlist
- If the origin isn't allowed, it returns a CORS error

### The Solution

**Add these domains to the API Gateway's CORS allowed origins:**

For local development:
```
http://localhost:3000
```

For production:
```
https://docs.andamio.io
```

### Where to Configure CORS

The API Gateway needs to be configured to allow these origins. This is typically done in:
- API Gateway configuration file
- Environment variables
- CORS middleware settings

**Configuration needed:**
```
ALLOWED_ORIGINS=http://localhost:3000,https://docs.andamio.io
```

Or in Go (Fiber):
```go
app.Use(cors.New(cors.Config{
    AllowOrigins: "http://localhost:3000,https://docs.andamio.io",
    AllowHeaders: "Origin,Content-Type,Accept,Authorization,X-API-Key",
    AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
}))
```

## Workaround for Testing

Until CORS is configured, users can test endpoints at the API Gateway's own Swagger UI:
```
https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/index.html
```

This works because it's on the same domain as the API.

## Updating Documentation

When the API Gateway schema changes:

```bash
# 1. Pull latest schema
curl -s https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/doc.json -o data/andamio-api-gateway.json

# 2. Generate documentation
npm run generate-all-api-docs

# 3. Organize into directories
node scripts/organize-api-docs.mjs

# 4. Build and deploy
npm run build
```

The scripts automatically:
- Convert Swagger 2.0 → OpenAPI 3.0
- Add server URL for requests
- Generate 136 endpoint pages
- Organize by API tags
- Copy schema to public directory

## Files to Know

- **`CLAUDE.md`** - Complete technical documentation for Claude
- **`scripts/generate-all-api-docs.mjs`** - Generates MDX from schema
- **`scripts/organize-api-docs.mjs`** - Organizes files by tags
- **`lib/source.ts`** - OpenAPI integration config
- **`app/api/proxy/route.ts`** - Proxy request handler
- **`content/docs/api/index.mdx`** - User-facing authentication guide

## Next Steps

1. **Add CORS Origins** - Configure API Gateway to allow docs site origins
2. **Test Locally** - Verify "Try it out" works on `localhost:3000`
3. **Deploy** - Push to production and test on live domain
4. **Verify** - Confirm users can authenticate and test endpoints

## Questions?

- Technical setup details: See `CLAUDE.md`
- API Gateway source: https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/doc.json
- Live Swagger UI: https://andamio-api-308006323670.us-central1.run.app/api/v1/docs/index.html