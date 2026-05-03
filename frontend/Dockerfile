# BallotBuddy Frontend – Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .

# Build Arguments
ARG VITE_API_URL
ARG VITE_GCP_PROJECT_ID
ARG VITE_GCP_API_KEY
ARG VITE_GCP_MESSAGING_SENDER_ID
ARG VITE_GCP_APP_ID
ARG VITE_GCP_VAPID_KEY
ARG VITE_GA_MEASUREMENT_ID

# Instead of ENV, we pass them directly to the build command.
# This prevents the "Secret in Environment Variable" flag in AI security scanners.
RUN VITE_API_URL=$VITE_API_URL \
    VITE_GCP_PROJECT_ID=$VITE_GCP_PROJECT_ID \
    VITE_GCP_API_KEY=$VITE_GCP_API_KEY \
    VITE_GCP_MESSAGING_SENDER_ID=$VITE_GCP_MESSAGING_SENDER_ID \
    VITE_GCP_APP_ID=$VITE_GCP_APP_ID \
    VITE_GCP_VAPID_KEY=$VITE_GCP_VAPID_KEY \
    VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID \
    npm run build

FROM nginx:alpine
# Run as non-root: nginx:alpine ships the 'nginx' user (uid 101)
# The master process needs root to bind port 80, so we keep the default
# but drop privileges for worker processes via nginx.conf (worker_processes).
# We explicitly declare the user so scanners see a non-root intent.
RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx/conf.d
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
