# syntax=docker/dockerfile:1

FROM node:24-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN npm install -g pnpm@12.14.0
WORKDIR /app

# Production dependencies only (the server's runtime needs: steam-user, steam-session, globaloffensive, qrcode).
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Build the web app.
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY index.html tsconfig*.json vite.config.ts ./
COPY public ./public
COPY src ./src
RUN pnpm exec vp build

FROM node:24-slim AS runtime
ENV NODE_ENV=production \
    OPENINVENTORY_HOST=0.0.0.0 \
    OPENINVENTORY_PORT=3000 \
    OPENINVENTORY_DATA_DIR=/data \
    OPENINVENTORY_WEB_DIR=/app/dist
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY server ./server
# The server shares config and type constants with the web app.
COPY src/lib ./src/lib
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.ts"]
