# EPIC-02 — Catálogo & Canais

Cobre RF-03, RF-04. Revisado após [ADR-0011](../../adr/0011-channel-as-aggregate.md) — a antiga "assinatura de nicho" virou criação de `Channel`.

## Feature EPIC-02.F1 — Catálogo de Nichos

### História EPIC-02.F1.S1 — Listagem e detalhe

**EPIC-02.F1.S1.T1 — Domain: `Niche` + `NicheRepository` + `GET /v1/niches`, `GET /v1/niches/:id`**
- Objetivo: implementar RF-03 (catálogo somente leitura, usado na criação de canal).
- Descrição: entidade `Niche` (ver [domain/entities-value-objects.md](../../domain/entities-value-objects.md)), repositório com `findActiveCatalog`, endpoints paginados.
- Arquivos: `apps/api/src/domain/catalog/entities/Niche.ts`, `apps/api/src/infrastructure/repositories/NichePrismaRepository.ts`, controllers.
- Dependências: EPIC-00.F2.S1.T2 (seed com nichos de exemplo).
- Critérios de aceite: conforme [api/niches-api.md](../../api/niches-api.md).
- Testes obrigatórios: integração — apenas nichos `ACTIVE` retornados; paginação correta.
- Estimativa: 3 pontos.
- Checklist: [ ] tenant não pode criar/editar nicho (sem endpoint de escrita nesta feature).

## Feature EPIC-02.F2 — Canais

### História EPIC-02.F2.S1 — Criar, editar, pausar canal

**EPIC-02.F2.S1.T1 — `PlanLimitsPolicy` + `PublishSlotAllocator` + `ChannelFactory` + `CreateChannelUseCase` + `POST /v1/channels`**
- Objetivo: implementar RF-04/RF-06 — criação de canal com nicho, config de geração/publicação e limite de plano.
- Descrição: `PlanLimitsPolicy` valida `maxChannels`/`maxVideosPerDayPerChannel`; `PublishSlotAllocator` distribui horários automaticamente quando não informados; `ChannelFactory` cria `Channel` em `DRAFT`.
- Arquivos: `apps/api/src/domain/billing/policies/PlanLimitsPolicy.ts`, `apps/api/src/domain/channel-management/services/PublishSlotAllocator.ts`, `apps/api/src/domain/channel-management/factories/ChannelFactory.ts`, `apps/api/src/application/use-cases/channel-management/CreateChannelUseCase.ts`.
- Dependências: EPIC-02.F1.S1.T1, EPIC-03 (Plan/Subscription devem existir).
- Critérios de aceite: conforme [api/channels-api.md](../../api/channels-api.md) — bloqueia acima do limite, rejeita nicho inativo, valida `publishTimes.length == videosPerDay`.
- Testes obrigatórios: unitário da policy e do allocator (todos os limites/distribuições); integração do endpoint (todos os códigos de erro documentados).
- Estimativa: 5 pontos.
- Checklist: [ ] `nicheId` imutável após criação, validado no domínio (não só na API).

**EPIC-02.F2.S1.T2 — `UpdateChannelConfigUseCase` + `PATCH /v1/channels/:id`**
- Objetivo: editar configuração de canal existente (nome, idioma, vídeos/dia, horários, plataformas, thumbnail, prompt override).
- Descrição: reaplica `PlanLimitsPolicy`; efeito só a partir do próximo lote (não interrompe lote em andamento).
- Arquivos: `apps/api/src/application/use-cases/channel-management/UpdateChannelConfigUseCase.ts`.
- Dependências: EPIC-02.F2.S1.T1.
- Critérios de aceite: conforme [api/channels-api.md](../../api/channels-api.md).
- Testes obrigatórios: integração (edição não afeta lote já disparado; `nicheId` não editável retorna erro).
- Estimativa: 3 pontos.
- Checklist: [ ] evento `ChannelConfigUpdated` publicado para o Scheduler Worker atualizar o repeatable job.

**EPIC-02.F2.S1.T3 — Pausar/retomar/remover canal**
- Objetivo: implementar RF-14.
- Descrição: `PATCH /v1/channels/:id/status` e `DELETE /v1/channels/:id`; transição para `ACTIVE` exige `IsChannelReadyToPublishSpecification`.
- Arquivos: `apps/api/src/application/use-cases/channel-management/PauseChannelUseCase.ts`, controllers.
- Dependências: EPIC-02.F2.S1.T1, EPIC-04 (contas sociais).
- Critérios de aceite: conforme [api/channels-api.md](../../api/channels-api.md); job em andamento não é interrompido pela pausa.
- Testes obrigatórios: unitário (transições de estado válidas); integração (pausa não afeta job já enfileirado; `ACTIVE` bloqueado sem contas conectadas).
- Estimativa: 3 pontos.
- Checklist: [ ] histórico de `GeneratedVideo` preservado ao remover canal.
