# Build context: repo root
# --- Build stage ---
FROM node:20-slim AS builder

ARG REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql
ENV REACT_APP_GRAPHQL_URL=$REACT_APP_GRAPHQL_URL

ARG REACT_APP_PAGE_SIZE=5
ENV REACT_APP_PAGE_SIZE=$REACT_APP_PAGE_SIZE

WORKDIR /app

COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
RUN npm ci -w packages/frontend

COPY packages/frontend/public ./packages/frontend/public
COPY packages/frontend/src ./packages/frontend/src
COPY packages/frontend/tsconfig.json ./packages/frontend/

RUN npm run build -w packages/frontend

# --- Runtime stage ---
FROM nginx:alpine AS runtime

COPY --from=builder /app/packages/frontend/build /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
