# EPIC-00 — Fundação Técnica e Infraestrutura

Habilita todos os demais épicos: monorepo, schema de banco inicial, deploy básico, CI.

## Feature EPIC-00.F1 — Monorepo e Tooling

### História EPIC-00.F1.S1 — Setup do monorepo

**EPIC-00.F1.S1.T1 — Inicializar monorepo pnpm + Turborepo**
- Objetivo: criar esqueleto do monorepo com workspaces `apps/*` e `packages/*`.
- Descrição: configurar `pnpm-workspace.yaml`, `turbo.json`, `package.json` raiz, TypeScript base (`tsconfig.base.json`, strict mode).
- Arquivos: `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `package.json`.
- Dependências: nenhuma.
- Critérios de aceite: `pnpm install` funciona; `pnpm build` roda (mesmo vazio) em todos os workspaces.
- Testes obrigatórios: nenhum (infraestrutura de build, validado por CI passando).
- Estimativa: 3 pontos.
- Checklist: [ ] workspaces configurados [ ] TS strict habilitado [ ] build local ok.

**EPIC-00.F1.S1.T2 — Configurar ESLint/Prettier compartilhados**
- Objetivo: padronizar lint/format em todo o monorepo (ver [structure/conventions.md](../../structure/conventions.md)).
- Descrição: criar `packages/config/eslint-preset`, `packages/config/prettier-preset`, aplicar em cada `apps/*`.
- Arquivos: `packages/config/eslint-preset/*`, `packages/config/prettier-preset/*`, `.eslintrc.*` por app.
- Dependências: EPIC-00.F1.S1.T1.
- Critérios de aceite: `pnpm lint` roda em todos os pacotes sem erro em código placeholder.
- Testes obrigatórios: nenhum.
- Estimativa: 2 pontos.
- Checklist: [ ] regra `no-explicit-any` ativa [ ] regra `no-floating-promises` ativa.

**EPIC-00.F1.S1.T3 — Pipeline de CI básico (lint/typecheck/test)**
- Objetivo: primeira versão do pipeline de PR (ver [cicd/pipeline.md](../../cicd/pipeline.md)).
- Descrição: workflow GitHub Actions rodando lint, type-check e testes (ainda vazios) a cada PR.
- Arquivos: `.github/workflows/pr.yml`.
- Dependências: EPIC-00.F1.S1.T1, T2.
- Critérios de aceite: PR de teste dispara o workflow e reporta status.
- Testes obrigatórios: nenhum (é o próprio pipeline de teste).
- Estimativa: 3 pontos.
- Checklist: [ ] workflow roda em push e PR [ ] cache de dependências configurado.

## Feature EPIC-00.F2 — Banco de Dados e Schema Inicial

### História EPIC-00.F2.S1 — Schema Prisma inicial

**EPIC-00.F2.S1.T1 — Criar schema Prisma completo (todas as entidades do ER model)**
- Objetivo: traduzir [database/er-model.md](../../database/er-model.md) em schema Prisma real.
- Descrição: modelar todas as tabelas, relacionamentos, índices e constraints únicas descritas em [database/relationships-indexes.md](../../database/relationships-indexes.md).
- Arquivos: `packages/database/prisma/schema.prisma`.
- Dependências: EPIC-00.F1.S1.T1.
- Critérios de aceite: `prisma validate` passa; todas as 15 entidades do ER model presentes com FKs corretas.
- Testes obrigatórios: teste de integração que aplica o schema em Postgres efêmero (Testcontainers) e valida constraints únicas críticas (ex.: `schedule_run_id`, `(generated_video_id, social_account_id)`).
- Estimativa: 5 pontos.
- Checklist: [ ] todas entidades presentes [ ] índices de [relationships-indexes.md](../../database/relationships-indexes.md) aplicados [ ] soft delete nos 3 casos documentados.

**EPIC-00.F2.S1.T2 — Migration inicial + seed de desenvolvimento**
- Objetivo: gerar primeira migration e seed determinístico (ver [database/migrations.md](../../database/migrations.md)).
- Descrição: `prisma migrate dev` para gerar migration inicial; script de seed com 3 nichos, 1 plano por tier, 2 vídeos-fonte de exemplo por nicho.
- Arquivos: `packages/database/prisma/migrations/*_init/`, `packages/database/prisma/seed.ts`.
- Dependências: EPIC-00.F2.S1.T1.
- Critérios de aceite: `prisma migrate deploy` + `prisma db seed` rodam limpos em banco vazio.
- Testes obrigatórios: teste de integração validando que seed cria os registros esperados.
- Estimativa: 2 pontos.
- Checklist: [ ] seed não roda em produção por engano (guard de ambiente) [ ] nomenclatura de migration segue convenção.

## Feature EPIC-00.F3 — Infraestrutura de Deploy

### História EPIC-00.F3.S1 — Deploy inicial dos 3 artefatos

**EPIC-00.F3.S1.T1 — Deploy `apps/web` na Vercel**
- Objetivo: primeiro deploy do frontend Next.js (ver [ADR-0007](../../adr/0007-deploy-target-vercel-railway.md)).
- Descrição: conectar repositório à Vercel, configurar variáveis de ambiente por ambiente (`staging`/`production`).
- Arquivos: `apps/web/next.config.js`, `vercel.json` (se necessário).
- Dependências: EPIC-00.F1.S1.T1.
- Critérios de aceite: preview deployment funciona por PR; deploy de produção funciona a partir de `main`.
- Testes obrigatórios: nenhum (validação manual de smoke).
- Estimativa: 2 pontos.
- Checklist: [ ] envs de staging/produção separadas [ ] preview deployment ativo.

**EPIC-00.F3.S1.T2 — Deploy `apps/api` e placeholders dos 7 workers no Railway/Render**
- Objetivo: primeiro deploy da API e esqueleto Docker de cada worker.
- Descrição: Dockerfile por app/worker; 8 serviços configurados no Railway/Render (1 API + 7 workers), inicialmente com handlers vazios/echo.
- Arquivos: `apps/api/Dockerfile`, `apps/workers/*/Dockerfile`.
- Dependências: EPIC-00.F1.S1.T1, EPIC-00.F2.S1.T2.
- Critérios de aceite: todos os 8 serviços sobem e respondem health check básico.
- Testes obrigatórios: nenhum (infra).
- Estimativa: 5 pontos.
- Checklist: [ ] cada worker consome sua fila nomeada (mesmo vazia) [ ] `/healthz` implementado em todos.

**EPIC-00.F3.S1.T3 — Provisionar Redis gerenciado**
- Objetivo: disponibilizar `REDIS_URL` para BullMQ (ver [ADR-0010](../../adr/0010-queue-redis-bullmq.md)).
- Descrição: provisionar Redis (Railway/Upstash), configurar TLS em produção.
- Arquivos: variáveis de ambiente por serviço.
- Dependências: EPIC-00.F3.S1.T2.
- Critérios de aceite: worker de teste consegue conectar e processar 1 job de smoke test.
- Testes obrigatórios: teste de integração com Redis efêmero (Testcontainers) validando conexão e um job trivial ponta a ponta.
- Estimativa: 2 pontos.
- Checklist: [ ] TLS habilitado em produção [ ] connection pool configurado.
