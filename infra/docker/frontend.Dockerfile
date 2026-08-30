#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f infra/docker/frontend.Dockerfile -t civicvision-frontend .

# ---------- Stage 1: dependencies (workspace-scoped) ----------
FROM node:22-alpine AS deps
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/shared-ui/package.json packages/shared-ui/package.json
COPY packages/config/package.json packages/config/package.json

# Scoped to the frontend workspace — verified to correctly exclude the
# backend's dependencies (Express, Prisma, bcryptjs, etc.) from this install.
RUN npm ci --workspace=apps/frontend

# ---------- Stage 2: build ----------
FROM node:22-alpine AS builder
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/frontend apps/frontend
# shared-types/shared-ui/config are consumed as raw source (no build
# step of their own) via npm workspace symlinks — node_modules/@civicvision/*
# is a symlink to these directories, so the actual source must be
# present here too, not just the symlink copied above.
COPY packages/shared-types packages/shared-types
COPY packages/shared-ui packages/shared-ui
COPY packages/config packages/config

ARG VITE_API_BASE_URL=http://localhost:5000/api/v1
ARG VITE_AI_SERVICE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_AI_SERVICE_URL=${VITE_AI_SERVICE_URL}

WORKDIR /repo/apps/frontend
RUN npm run build

# ---------- Stage 3: production (static file server) ----------
FROM nginx:1.27-alpine AS production

COPY infra/nginx/frontend.conf /etc/nginx/conf.d/default.conf

# Inject high-performance compression types and 3D asset caching headers into default.conf
RUN sed -i 's/gzip_types.*/gzip_types text\/plain text\/css application\/json application\/javascript text\/javascript text\/xml application\/xml application\/xml+rss image\/svg+xml image\/x-icon image\/webp image\/avif application\/octet-stream model\/gltf+json model\/gltf-binary application\/wasm;/g' /etc/nginx/conf.d/default.conf && \
    sed -i '/location \/assets\/ {/i \    # Cache 3D models and WebAssembly files aggressively\n    location ~* \\.(gltf|glb|bin|wasm|webp|avif)$ {\n        expires 1y;\n        add_header Cache-Control "public, immutable";\n        add_header Access-Control-Allow-Origin "*";\n    }\n' /etc/nginx/conf.d/default.conf

COPY --from=builder /repo/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
