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
# Build-time ARGs for Vite public env vars
#
# SAFETY NOTE – ARG vs RUN --mount=type=secret:
#   All VITE_* variables carry the "VITE_" prefix, which means Vite
#   intentionally embeds them in the compiled JS bundle (index.html).
#   They are PUBLIC client-side values (Firebase config, GA ID, etc.)
#   and must be known at build time. Using ARG here is the correct
#   and safe pattern; it is NOT equivalent to leaking a server secret.
#
#   We intentionally avoid ENV so the values are NOT preserved in the
#   final image layers, and do NOT appear in `docker inspect` output.
# ---------------------------------------------------------------------------
ARG VITE_API_URL
ARG VITE_GCP_PROJECT_ID
ARG VITE_GCP_API_KEY
ARG VITE_GCP_MESSAGING_SENDER_ID
ARG VITE_GCP_APP_ID
ARG VITE_GCP_VAPID_KEY
ARG VITE_GA_MEASUREMENT_ID

RUN VITE_API_URL=$VITE_API_URL \
    VITE_GCP_PROJECT_ID=$VITE_GCP_PROJECT_ID \
    VITE_GCP_API_KEY=$VITE_GCP_API_KEY \
    VITE_GCP_MESSAGING_SENDER_ID=$VITE_GCP_MESSAGING_SENDER_ID \
    VITE_GCP_APP_ID=$VITE_GCP_APP_ID \
    VITE_GCP_VAPID_KEY=$VITE_GCP_VAPID_KEY \
    VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID \
    npm run build

# ============================================================
# Stage 2: Serve with nginx
# ============================================================
# SAFETY NOTE – nginx:alpine and root:
#   nginx:alpine ships uid 101 ("nginx"). The master process binds
#   port 80 and MUST start as root (Linux capability NET_BIND_SERVICE
#   requires uid 0 for ports < 1024). After binding, nginx immediately
#   drops to the "nginx" user for all worker processes (configured via
#   the `user nginx;` directive in nginx.conf).
#
#   We explicitly set USER nginx AFTER the chown so the image metadata
#   reflects a non-root intent, and any exec into the container lands
#   as "nginx", not "root". The CMD uses the nginx master which
#   re-acquires root transiently only to bind the socket.
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

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
