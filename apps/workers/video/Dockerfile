# See docs/DEPLOYMENT.md and docs/workers/video-worker.md
FROM node:20-alpine AS base
RUN corepack enable && npm install -g turbo@2

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @clip-flow/worker-video --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
COPY tsconfig.base.json ./tsconfig.base.json
RUN pnpm turbo run build --filter=@clip-flow/worker-video

# dist/main.js is fully bundled (tsup noExternal) — the runner stage needs
# nothing but that one file, no node_modules.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# FFmpeg via apk (ADR-0009) — pin to an exact alpine package version once
# EPIC-06.F4 lands, to avoid silent drift across rebuilds. OpenCV native
# bindings for FocusDetector (EPIC-06.F4.S1.T2) go in this stage too then.
RUN apk add --no-cache ffmpeg && \
    addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 worker
COPY --from=installer /app/apps/workers/video/dist ./dist
USER worker
EXPOSE 3000
CMD ["node", "dist/main.js"]
