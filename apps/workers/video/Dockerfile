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
# nothing but that one file plus the Python analysis script, no node_modules.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# FFmpeg (ADR-0009) + Python/OpenCV for FocusDetector (EPIC-06.F4.S1.T2) —
# OpenCV runs as a separate Python process invoked via child_process, not a
# native Node binding (simpler dependency surface, more stable across
# rebuilds — see docs/integrations/opencv.md).
RUN apk add --no-cache ffmpeg python3 py3-opencv py3-numpy && \
    addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 worker
COPY --from=installer /app/apps/workers/video/dist ./dist
COPY --from=pruner /app/apps/workers/video/scripts ./scripts
COPY --from=pruner /app/apps/workers/video/models ./models
USER worker
EXPOSE 3000
CMD ["node", "dist/main.js"]
