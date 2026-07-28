# Issues — EPIC-00 Fundação Técnica e Infraestrutura

---

### ISSUE-00.F1.S1.T1 — Inicializar monorepo pnpm + Turborepo
**Descrição**: criar esqueleto do monorepo com workspaces `apps/*` e `packages/*`.
**Objetivo**: habilitar todo desenvolvimento subsequente com build/lint/test compartilhados.
**Motivação**: sem monorepo configurado, nenhuma outra Issue pode começar — é a base de tudo (ver [ADR-0001](../../adr/0001-monorepo-vs-polyrepo.md)).
**Arquivos envolvidos**: `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `package.json`.
**Critérios de aceite**: `pnpm install` funciona; `pnpm build` roda em todos os workspaces.
**Critérios de teste**: nenhum teste automatizado (infraestrutura de build); validado por CI passando (ver ISSUE-00.F1.S1.T3).
**Checklist**: [ ] workspaces configurados [ ] TS strict habilitado [ ] build local ok.
**Dependências**: nenhuma.
**Labels**: `epic:EPIC-00`, `type:chore`, `layer:infra`, `priority:P0`.
**Prioridade**: P0.
**Complexidade**: Baixa.
**Tempo estimado**: 1 dia (3 pontos).

---

### ISSUE-00.F1.S1.T2 — Configurar ESLint/Prettier compartilhados
**Descrição**: padronizar lint/format em todo o monorepo.
**Objetivo**: garantir consistência de código desde o primeiro PR.
**Motivação**: regras de qualidade (`no-explicit-any`, `no-floating-promises`) precisam existir antes que código de domínio comece a ser escrito, para não exigir retrabalho depois.
**Arquivos envolvidos**: `packages/config/eslint-preset/*`, `packages/config/prettier-preset/*`, `.eslintrc.*` por app.
**Critérios de aceite**: `pnpm lint` roda sem erro em código placeholder.
**Critérios de teste**: nenhum.
**Checklist**: [ ] `no-explicit-any` ativo [ ] `no-floating-promises` ativo.
**Dependências**: ISSUE-00.F1.S1.T1.
**Labels**: `epic:EPIC-00`, `type:chore`, `layer:infra`, `priority:P0`.
**Prioridade**: P0.
**Complexidade**: Baixa.
**Tempo estimado**: 0.5 dia (2 pontos).

---

### ISSUE-00.F1.S1.T3 — Pipeline de CI básico (lint/typecheck/test)
**Descrição**: primeira versão do pipeline de PR.
**Objetivo**: bloquear merge de código que não passa nos checks mínimos.
**Motivação**: sem CI desde o início, dívida de qualidade se acumula silenciosamente (ver [testing/coverage-pipeline.md](../../testing/coverage-pipeline.md)).
**Arquivos envolvidos**: `.github/workflows/pr.yml`.
**Critérios de aceite**: PR de teste dispara o workflow e reporta status.
**Critérios de teste**: nenhum (é o próprio pipeline).
**Checklist**: [ ] roda em push e PR [ ] cache de dependências configurado.
**Dependências**: ISSUE-00.F1.S1.T1, ISSUE-00.F1.S1.T2.
**Labels**: `epic:EPIC-00`, `type:chore`, `layer:infra`, `priority:P0`.
**Prioridade**: P0.
**Complexidade**: Baixa.
**Tempo estimado**: 1 dia (3 pontos).

---

### ISSUE-00.F2.S1.T1 — Criar schema Prisma completo
**Descrição**: traduzir o ER model em schema Prisma real.
**Objetivo**: ter a fonte única de verdade de schema disponível para todo o backend.
**Motivação**: toda entidade documentada em [domain/entities-value-objects.md](../../domain/entities-value-objects.md) precisa de uma tabela real antes que qualquer repositório possa ser implementado.
**Arquivos envolvidos**: `packages/database/prisma/schema.prisma`.
**Critérios de aceite**: `prisma validate` passa; 15 entidades presentes com FKs corretas.
**Critérios de teste**: integração — aplica schema em Postgres efêmero (Testcontainers), valida constraints únicas críticas.
**Checklist**: [ ] entidades completas [ ] índices de [relationships-indexes.md](../../database/relationships-indexes.md) aplicados [ ] soft delete nos 3 casos documentados.
**Dependências**: ISSUE-00.F1.S1.T1.
**Labels**: `epic:EPIC-00`, `type:feature`, `layer:infra`, `priority:P0`.
**Prioridade**: P0.
**Complexidade**: Média.
**Tempo estimado**: 2 dias (5 pontos).

---

### ISSUE-00.F2.S1.T2 — Migration inicial + seed de desenvolvimento
**Descrição**: gerar primeira migration e seed determinístico.
**Objetivo**: permitir que qualquer desenvolvedor suba ambiente local com dados de exemplo.
**Motivação**: sem seed, testar fluxos de nicho/plano manualmente exige criação manual repetitiva de dados.
**Arquivos envolvidos**: `packages/database/prisma/migrations/*_init/`, `packages/database/prisma/seed.ts`.
**Critérios de aceite**: `prisma migrate deploy` + `prisma db seed` rodam limpos em banco vazio.
**Critérios de teste**: integração validando registros criados pelo seed.
**Checklist**: [ ] seed não roda em produção (guard de ambiente) [ ] nomenclatura de migration segue convenção.
**Dependências**: ISSUE-00.F2.S1.T1.
**Labels**: `epic:EPIC-00`, `type:chore`, `layer:infra`, `priority:P0`.
**Prioridade**: P0.
**Complexidade**: Baixa.
**Tempo estimado**: 0.5 dia (2 pontos).

---

### ISSUE-00.F3.S1.T1 — Deploy `apps/web` na Vercel
**Descrição**: primeiro deploy do frontend.
**Objetivo**: ter ambiente de staging/produção acessível desde o início do projeto.
**Motivação**: validar cedo que a cadeia de deploy funciona reduz risco de surpresa no fim da Sprint 1 (ver [ADR-0007](../../adr/0007-deploy-target-vercel-railway.md)).
**Arquivos envolvidos**: `apps/web/next.config.js`, `vercel.json`.
**Critérios de aceite**: preview deployment por PR; deploy de produção a partir de `main`.
**Critérios de teste**: nenhum (smoke manual).
**Checklist**: [ ] envs de staging/produção separadas [ ] preview deployment ativo.
**Dependências**: ISSUE-00.F1.S1.T1.
**Labels**: `epic:EPIC-00`, `type:chore`, `layer:infra`, `priority:P0`.
**Prioridade**: P0.
**Complexidade**: Baixa.
**Tempo estimado**: 0.5 dia (2 pontos).

---

### ISSUE-00.F3.S1.T2 — Deploy `apps/api` e placeholders dos 7 workers
**Descrição**: primeiro deploy da API e esqueleto Docker de cada worker.
**Objetivo**: validar cadeia de deploy de todos os 8 serviços backend antes de implementar lógica de negócio.
**Motivação**: 7 workers + API são 8 pipelines de deploy distintos — validar isso cedo evita descobrir problema de infraestrutura no meio de uma sprint de feature.
**Arquivos envolvidos**: `apps/api/Dockerfile`, `apps/workers/*/Dockerfile`.
**Critérios de aceite**: todos os 8 serviços sobem e respondem health check básico.
**Critérios de teste**: nenhum (infra).
**Checklist**: [ ] cada worker consome sua fila nomeada (mesmo vazia) [ ] `/healthz` implementado em todos.
**Dependências**: ISSUE-00.F1.S1.T1, ISSUE-00.F2.S1.T2.
**Labels**: `epic:EPIC-00`, `type:chore`, `layer:infra`, `priority:P0`.
**Prioridade**: P0.
**Complexidade**: Alta.
**Tempo estimado**: 3 dias (5 pontos).

---

### ISSUE-00.F3.S1.T3 — Provisionar Redis gerenciado
**Descrição**: disponibilizar `REDIS_URL` para BullMQ.
**Objetivo**: habilitar comunicação assíncrona entre API e workers.
**Motivação**: nenhum worker funciona sem fila — é pré-requisito de todo o restante do backlog assíncrono (ver [ADR-0010](../../adr/0010-queue-redis-bullmq.md)).
**Arquivos envolvidos**: variáveis de ambiente por serviço.
**Critérios de aceite**: worker de teste processa 1 job de smoke test.
**Critérios de teste**: integração com Redis efêmero (Testcontainers).
**Checklist**: [ ] TLS habilitado em produção [ ] connection pool configurado.
**Dependências**: ISSUE-00.F3.S1.T2.
**Labels**: `epic:EPIC-00`, `type:chore`, `layer:infra`, `priority:P0`.
**Prioridade**: P0.
**Complexidade**: Baixa.
**Tempo estimado**: 0.5 dia (2 pontos).
