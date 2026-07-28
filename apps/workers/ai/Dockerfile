# See docs/DEPLOYMENT.md and docs/workers/ai-worker.md
FROM node:20-alpine AS base
RUN corepack enable && npm install -g turbo@2

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @clip-flow/worker-ai --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
COPY tsconfig.base.json ./tsconfig.base.json
RUN pnpm turbo run build --filter=@clip-flow/worker-ai

# dist/main.js is fully bundled (tsup noExternal) — the runner stage needs
# nothing but that one file, no node_modules.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 worker
COPY --from=installer /app/apps/workers/ai/dist ./dist
USER worker
EXPOSE 3000
CMD ["node", "dist/main.js"]
