# Build context: repo root
# --- Build stage ---
FROM node:20-slim AS builder

WORKDIR /app

# Copy workspace manifests + lockfile so npm ci works from root
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
RUN npm ci -w packages/backend

COPY packages/backend/tsconfig.json ./packages/backend/
COPY packages/backend/src ./packages/backend/src
RUN npm run build -w packages/backend

# --- Runtime stage ---
FROM node:20-slim AS runtime

# Install Chromium for Puppeteer scraping
RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Point Puppeteer to system Chromium instead of downloading its own
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
RUN npm ci -w packages/backend --omit=dev

COPY --from=builder /app/packages/backend/dist ./dist

RUN mkdir -p /app/data

EXPOSE 4000

CMD ["node", "dist/index.js"]
