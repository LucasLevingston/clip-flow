# Deploy

Ver decisão de plataforma em [ADR-0007](adr/0007-deploy-target-vercel-railway.md) e pipeline completo em [cicd/pipeline.md](cicd/pipeline.md). Este documento cobre o procedimento operacional, não a decisão.

## Topologia de deploy

| Artefato | Plataforma | Réplicas (MVP) |
|---|---|---|
| `apps/web` | Vercel | Serverless/Edge, autoescala |
| `apps/api` | Railway/Render | 2 réplicas |
| `apps/workers/scheduler` | Railway/Render | 1 réplica |
| `apps/workers/ai` | Railway/Render | 2 réplicas |
| `apps/workers/video` | Railway/Render | 2 réplicas (CPU-bound — ver [ADR-0009](adr/0009-video-processing-ffmpeg-opencv.md)) |
| `apps/workers/upload` | Railway/Render | 2 réplicas |
| `apps/workers/analytics` | Railway/Render | 1 réplica |
| `apps/workers/notification` | Railway/Render | 1 réplica |
| `apps/workers/health` | Railway/Render | 1 réplica |
| Postgres | Supabase | Gerenciado |
| Redis | Railway/Upstash | Gerenciado |

## Procedimento de deploy (automático)

Deploy é sempre automático via merge em `main` (ver [cicd/pipeline.md](cicd/pipeline.md)) — não há deploy manual em condições normais.

## Deploy manual de emergência (hotfix)

1. Branch `hotfix/<slug>` a partir de `main` (ver [structure/git-workflow.md](structure/git-workflow.md)).
2. PR direto para `main` com aprovação expedita.
3. Merge dispara pipeline normal — não pular etapas de teste mesmo em emergência.
4. Cherry-pick do hotfix de volta para `develop` no mesmo dia.

## Rollback

Rollback é acionado pela própria plataforma gerenciada em caso de falha de health check pós-deploy (RNF-25, automático). Rollback manual:
- **Vercel**: promover deployment anterior via dashboard/CLI (`vercel rollback`).
- **Railway/Render**: reverter para deploy anterior via dashboard (mantém últimos N deploys disponíveis).

## Migrações em produção

Migrations rodam como etapa do pipeline, **antes** de subir a nova versão da API/workers (ver [database/migrations.md](database/migrations.md)). Nunca executar `prisma migrate deploy` manualmente contra produção fora do pipeline.

## Escalonamento manual (situação de pico)

Se o Health Worker (ver [workers/health-worker.md](workers/health-worker.md)) reportar fila `video` cronicamente acima do limiar, aumentar réplicas do Video Worker via dashboard da plataforma de deploy — não requer mudança de código (workers são stateless, RNF-12).
