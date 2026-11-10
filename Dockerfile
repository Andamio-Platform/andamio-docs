# docs.andamio.io on Cloud Run (Andamio-Platform/andamio-ops#578). Next.js
# standalone output, served by `server.js` on $PORT (Cloud Run sets it).
# Builds on the Debian slim node image and runs on distroless, both pinned by
# digest. The runtime has no shell or package manager and runs as nonroot; its
# entrypoint is node, so CMD names only the script. Move both images together,
# to digests carrying the Node patch in .nvmrc.
FROM node:26-trixie-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-trixie-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072 AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs26-debian13:nonroot@sha256:33c86a63859efc2ebd88ea0a355863582ec6f1220d048de62baffb2584e709b3 AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0
COPY --from=build --chown=nonroot:nonroot /app/public ./public
COPY --from=build --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=build --chown=nonroot:nonroot /app/.next/static ./.next/static
EXPOSE 8080
CMD ["server.js"]
