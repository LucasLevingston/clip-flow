# EPIC-10 — Administração da Plataforma

Cobre RF-15, RF-16.

## Feature EPIC-10.F1 — Admin Console (Nichos e Prompt Templates)

### História EPIC-10.F1.S1 — Gestão de nichos

**EPIC-10.F1.S1.T1 — `requirePlatformAdmin()` middleware + `POST/PATCH /v1/admin/niches`**
- Objetivo: implementar RF-15 (base de autorização administrativa).
- Descrição: middleware específico checando `user.isPlatformAdmin`; endpoints de criação/edição de nicho.
- Arquivos: `apps/api/src/interface/http/middlewares/platform-admin.middleware.ts`, controllers admin.
- Dependências: EPIC-01.
- Critérios de aceite: conforme [api/admin-api.md](../../api/admin-api.md); ação auditada.
- Testes obrigatórios: integração (usuário não-admin recebe 403; ação gera `audit_log`).
- Estimativa: 3 pontos.
- Checklist: [ ] `PLATFORM_ADMIN` funciona independente de `Membership` de tenant.

**EPIC-10.F1.S1.T2 — `POST /v1/admin/niches/:id/prompt-templates`**
- Objetivo: versionamento de prompts por nicho (RF-15).
- Descrição: nova versão não sobrescreve a anterior; torna-se a ativa do nicho.
- Arquivos: `apps/api/src/application/use-cases/catalog/CreatePromptTemplateUseCase.ts`.
- Dependências: EPIC-10.F1.S1.T1.
- Critérios de aceite: conforme [api/admin-api.md](../../api/admin-api.md); `GeneratedVideo` registra `promptTemplateVersion` usado.
- Testes obrigatórios: integração (versão incrementa corretamente; versão anterior permanece consultável).
- Estimativa: 3 pontos.
- Checklist: [ ] AI Worker (EPIC-06) lê sempre a versão ativa mais recente.

### História EPIC-10.F1.S2 — Admin Console (Frontend)

**EPIC-10.F1.S2.T1 — Feature `admin/niches` — UI de gestão**
- Objetivo: UI para curadoria de nichos e conteúdo-fonte.
- Descrição: página `(admin)/niches`, formulário de criação/edição, listagem de `SourceVideo` por status com ação de aprovar/rejeitar.
- Arquivos: `apps/web/src/features/admin-niches/*`.
- Dependências: EPIC-10.F1.S1, EPIC-06.F1.
- Critérios de aceite: fluxo completo de curadoria operável via UI, sem acesso direto ao banco.
- Testes obrigatórios: RTL + MSW (formulário, listagem, ação de aprovação).
- Estimativa: 5 pontos.
- Checklist: [ ] acesso à rota `(admin)` bloqueado no client para não-`PLATFORM_ADMIN` (defesa em profundidade — servidor já bloqueia via API).

## Feature EPIC-10.F2 — Health e Observabilidade Operacional

### História EPIC-10.F2.S1 — Health Worker

**EPIC-10.F2.S1.T1 — Health Worker (checagem de filas + integrações)**
- Objetivo: implementar RF-16 (ver [workers/health-worker.md](../../workers/health-worker.md)).
- Descrição: cron interno de 1 min, snapshot de filas via API do BullMQ, health-check leve de cada integração externa.
- Arquivos: `apps/workers/src/health/application/use-cases/CheckPlatformHealthUseCase.ts`, `apps/workers/src/health/main.ts`.
- Dependências: EPIC-00, todos os workers já existentes até este ponto do roadmap.
- Critérios de aceite: `QueueThresholdExceeded`/`IntegrationDegraded` disparados conforme regras documentadas.
- Testes obrigatórios: unitário (regras de alerta); integração (fila real com jobs falhos simulados dispara alerta).
- Estimativa: 5 pontos.
- Checklist: [ ] falha do próprio Health Worker não derruba o processo (try/catch por ciclo).

**EPIC-10.F2.S1.T2 — `GET /v1/admin/health` + dashboard operacional (Frontend)**
- Objetivo: expor saúde da plataforma ao admin.
- Descrição: endpoint agregando snapshot mais recente; UI `(admin)/health` com status de filas e integrações.
- Arquivos: `apps/api/src/interface/http/controllers/admin-health.controller.ts`, `apps/web/src/features/admin-health/*`.
- Dependências: EPIC-10.F2.S1.T1.
- Critérios de aceite: conforme [api/admin-api.md](../../api/admin-api.md).
- Testes obrigatórios: integração do endpoint; RTL + MSW da UI.
- Estimativa: 5 pontos.
- Checklist: [ ] UI atualiza em polling curto (ex.: 30s) para refletir estado quase em tempo real.
