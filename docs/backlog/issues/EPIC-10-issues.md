# Issues — EPIC-10 Administração da Plataforma

---

### ISSUE-10.F1.S1.T1 — Middleware requirePlatformAdmin + CRUD de nichos
**Descrição**: base de autorização administrativa e gestão de nichos.
**Objetivo**: implementar RF-15.
**Motivação**: todo o resto da curadoria de conteúdo (EPIC-06) depende deste controle de acesso existir primeiro.
**Arquivos envolvidos**: `apps/api/src/interface/http/middlewares/platform-admin.middleware.ts`, controllers admin.
**Critérios de aceite**: conforme [api/admin-api.md](../../api/admin-api.md); ação auditada.
**Critérios de teste**: integração (não-admin → 403; ação gera `audit_log`).
**Checklist**: [ ] `PLATFORM_ADMIN` independente de `Membership` de tenant.
**Dependências**: EPIC-01.
**Labels**: `epic:EPIC-10`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-10.F1.S1.T2 — Versionamento de PromptTemplate
**Descrição**: criação de nova versão de prompt por nicho.
**Objetivo**: permitir evolução dos prompts de IA sem deploy de código (Objetivo O5).
**Motivação**: qualidade de seleção/copy vai melhorar iterativamente — precisa ser configurável, não hardcoded.
**Arquivos envolvidos**: `apps/api/src/application/use-cases/catalog/CreatePromptTemplateUseCase.ts`.
**Critérios de aceite**: conforme [api/admin-api.md](../../api/admin-api.md); `GeneratedVideo` registra versão usada.
**Critérios de teste**: integração (versão incrementa; versão anterior consultável).
**Checklist**: [ ] AI Worker lê sempre a versão ativa mais recente.
**Dependências**: ISSUE-10.F1.S1.T1.
**Labels**: `epic:EPIC-10`, `type:feature`, `layer:api`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-10.F1.S2.T1 — UI de gestão de nichos e conteúdo-fonte (Frontend)
**Descrição**: console administrativo de curadoria.
**Objetivo**: permitir que a equipe opere o RF-07/RF-15 sem acesso direto ao banco.
**Motivação**: curadoria é processo recorrente diário/semanal — precisa de ferramenta, não de query manual em produção.
**Arquivos envolvidos**: `apps/web/src/features/admin-niches/*`.
**Critérios de aceite**: fluxo completo de curadoria operável via UI.
**Critérios de teste**: RTL + MSW (formulário, listagem, aprovação).
**Checklist**: [ ] rota `(admin)` bloqueada no client para não-admin (defesa em profundidade).
**Dependências**: ISSUE-10.F1.S1.T1, EPIC-06.F1.
**Labels**: `epic:EPIC-10`, `type:feature`, `layer:frontend`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-10.F2.S1.T1 — Health Worker
**Descrição**: checagem periódica de filas e integrações externas.
**Objetivo**: implementar RF-16.
**Motivação**: sem monitoramento proativo, falhas silenciosas (fila travada, integração fora do ar) só seriam descobertas por reclamação de cliente.
**Arquivos envolvidos**: `apps/workers/src/health/application/use-cases/CheckPlatformHealthUseCase.ts`, `main.ts`.
**Critérios de aceite**: `QueueThresholdExceeded`/`IntegrationDegraded` disparados conforme regras.
**Critérios de teste**: unitário (regras de alerta); integração (fila com jobs falhos simulados).
**Checklist**: [ ] falha do próprio worker não derruba o processo.
**Dependências**: EPIC-00, workers já existentes até este ponto do roadmap.
**Labels**: `epic:EPIC-10`, `type:feature`, `layer:worker`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-10.F2.S1.T2 — Endpoint + dashboard operacional de saúde (Frontend)
**Descrição**: exposição de saúde da plataforma ao admin.
**Objetivo**: dar visibilidade operacional acionável à equipe.
**Motivação**: reduz tempo de detecção de incidente de "reclamação de cliente" para "alerta proativo".
**Arquivos envolvidos**: `apps/api/src/interface/http/controllers/admin-health.controller.ts`, `apps/web/src/features/admin-health/*`.
**Critérios de aceite**: conforme [api/admin-api.md](../../api/admin-api.md).
**Critérios de teste**: integração do endpoint; RTL + MSW da UI.
**Checklist**: [ ] UI atualiza em polling curto (~30s).
**Dependências**: ISSUE-10.F2.S1.T1.
**Labels**: `epic:EPIC-10`, `type:feature`, `layer:frontend`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).
