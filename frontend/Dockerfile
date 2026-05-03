# BallotBuddy Frontend – Dockerfile
# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (layer-cached until package files change).
# Sensitive files are excluded via .dockerignore (.env, *.local, etc.)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Selective COPY: only the source directories needed for the build.
# .dockerignore already blocks .env, node_modules, coverage, etc.
# We list explicit paths so a future accidental file addition cannot
# silently reach the image.
COPY public/ ./public/
COPY src/   ./src/
COPY index.html vite.config.js ./
# Copy any other config files present at the root (postcss, tailwind, etc.)
COPY *.config.js *.config.ts tsconfig*.json ./

# ---------------------------------------------------------------------------
# Build-time env vars injected via BuildKit secret mount
#
# COMPLIANCE NOTE – SonarCloud RSPEC-7466 / S6427:
#   ARG is NOT used for any VITE_* variable. Instead, we use
#   RUN --mount=type=secret which:
#     1. Injects values from a file at build time only
#     2. Does NOT create a new image layer containing the values
#     3. Does NOT appear in `docker history` or `docker inspect`
#     4. The secret file is destroyed after the RUN step completes
#
# The secret file (vite_env) is a standard .env format:
#   VITE_API_URL=https://...
#   VITE_GCP_API_KEY=AIza...
#   etc.
#
# Build command (local):
#   docker build --secret id=vite_env,src=.env.production -t ballotbuddy-frontend .
#
# Cloud Build passes the file via a preparatory step (see cloudbuild.yaml).
# ---------------------------------------------------------------------------
RUN --mount=type=secret,id=vite_env,target=/run/secrets/vite_env \
    set -a && . /run/secrets/vite_env && set +a && \
    npm run build

# ============================================================
# Stage 2: Serve with nginx
# ============================================================
# SAFETY NOTE – nginx:alpine, USER nginx, and port 8080:
#   nginx:alpine ships uid 101 ("nginx"). We run nginx as that user
#   (USER nginx below). Port 8080 is non-privileged, so nginx can bind
#   it without root. Cloud Run routes external HTTPS traffic to port 8080.
#   This is the correct Cloud Run + non-root nginx pattern.
# ============================================================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy compiled static assets with root ownership and restricted permissions.
#
# SECURITY NOTE – --chown=root:root --chmod:
#   Root owns all files; nginx worker processes (uid 101) have read-only
#   access via the group/other bits. Only root can write, satisfying the
#   container immutability principle and SonarCloud S2612/RSPEC-7466.
#
#   dist files  → --chmod=755 (rwxr-xr-x)
#     Directories need the execute bit for traversal; files served by
#     nginx only need read, but BuildKit's --chmod applies one mask to
#     all copied paths. 755 = root writes, everyone reads/traverses.
#
#   nginx.conf  → --chmod=644 (rw-r--r--)
#     Config file; no execute needed. Root can update it; nginx reads it.
COPY --from=builder --chown=root:root --chmod=755 /app/dist ./
COPY --chown=root:root --chmod=644 nginx.conf /etc/nginx/conf.d/default.conf

# Drop to non-root user for the container metadata and any exec sessions.
# The nginx master process itself starts as root to bind port 80, then
# immediately forks workers as the "nginx" user (uid 101).
USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
