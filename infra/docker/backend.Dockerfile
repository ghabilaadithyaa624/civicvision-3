#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f infra/docker/backend.Dockerfile -t civicvision-backend .
# (docker-compose.yml is already wired up this way — see `context: ..` there.)
#
# This is required because npm workspaces resolves dependencies from the
# root package.json + package-lock.json, not from apps/backend alone.

# ---------- Stage 1: dependencies (workspace-scoped, includes dev deps for building) ----------
FROM node:22-alpine AS deps
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/config/package.json packages/config/package.json

# Scoped to the backend workspace — verified to correctly exclude the
# frontend's dependencies (React, Vite, Tailwind, etc.) from this install.
RUN npm ci --workspace=apps/backend

# ---------- Stage 2: build (Prisma client + TypeScript compile) ----------
FROM node:22-alpine AS builder
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/backend apps/backend
# shared-types/config are consumed as raw source via npm workspace
# symlinks — node_modules/@civicvision/* is a symlink to these
# directories, so the actual source must be present here too.
COPY packages/shared-types packages/shared-types
COPY packages/config packages/config

WORKDIR /repo/apps/backend
RUN npx prisma generate
RUN npm run build

# ---------- Stage 3: production (lean, no dev dependencies) ----------
FROM node:22-alpine AS production

ENV NODE_ENV=production

RUN apk add --no-cache openssl && \
    addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs civicvision

WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm ci --workspace=apps/backend --omit=dev --no-audit --no-fund && npm cache clean --force

WORKDIR /repo/apps/backend
COPY --from=builder /repo/apps/backend/dist ./dist
COPY --from=builder /repo/apps/backend/prisma ./prisma
# Reuse the client generated in the builder stage rather than re-running
# `prisma generate` here — the `prisma` CLI is a dev dependency we
# deliberately excluded from this lean stage, and regenerating would
# mean a second engine-binary download for no benefit. Both stages
# share the same Alpine base, so the generated native binary is
# platform-compatible.
COPY --from=builder /repo/node_modules/.prisma /repo/node_modules/.prisma
# Copy the prisma CLI from the builder stage so we can run `migrate deploy`
# at container start-up without making prisma a production dependency.
COPY --from=builder /repo/node_modules/prisma /repo/node_modules/prisma
COPY --from=builder /repo/node_modules/.bin/prisma /repo/node_modules/.bin/prisma

RUN chown -R civicvision:nodejs /repo/apps/backend

USER civicvision
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["sh", "-c", "/repo/node_modules/.bin/prisma db push --accept-data-loss --skip-generate && node dist/server.js"]
