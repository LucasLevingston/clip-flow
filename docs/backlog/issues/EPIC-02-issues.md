# Issues — EPIC-02 Catálogo & Canais

> Revisado após [ADR-0011](../../adr/0011-channel-as-aggregate.md).

---

### ISSUE-02.F1.S1.T1 — Domain: Niche + NicheRepository + endpoints de catálogo
**Descrição**: expor catálogo de nichos somente leitura, usado na criação de canal.
**Objetivo**: implementar RF-03.
**Motivação**: sem catálogo navegável, nenhum tenant consegue criar um canal — bloqueia todo o restante do produto (UC03).
**Arquivos envolvidos**: `apps/api/src/domain/catalog/entities/Niche.ts`, `apps/api/src/infrastructure/repositories/NichePrismaRepository.ts`, controllers.
**Critérios de aceite**: conforme [api/niches-api.md](../../api/niches-api.md).
**Critérios de teste**: integração — apenas `ACTIVE` retornados; paginação correta.
**Checklist**: [ ] tenant não pode criar/editar nicho.
**Dependências**: ISSUE-00.F2.S1.T2.
**Labels**: `epic:EPIC-02`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-02.F2.S1.T1 — PlanLimitsPolicy + PublishSlotAllocator + ChannelFactory + CreateChannelUseCase
**Descrição**: criar canal com nicho, config de geração/publicação, respeitando limite de plano.
**Objetivo**: implementar RF-04/RF-06.
**Motivação**: é o ato central de configuração do produto (UC03) — sem isso, o pipeline automático nunca é acionado para nenhum tenant.
**Arquivos envolvidos**: `apps/api/src/domain/billing/policies/PlanLimitsPolicy.ts`, `apps/api/src/domain/channel-management/services/PublishSlotAllocator.ts`, `apps/api/src/domain/channel-management/factories/ChannelFactory.ts`, `apps/api/src/application/use-cases/channel-management/CreateChannelUseCase.ts`.
**Critérios de aceite**: conforme [api/channels-api.md](../../api/channels-api.md).
**Critérios de teste**: unitário da policy e do allocator (todos os limites/distribuições); integração (todos os códigos de erro).
**Checklist**: [ ] `nicheId` imutável após criação, validado no domínio.
**Dependências**: ISSUE-02.F1.S1.T1, EPIC-03.
**Labels**: `epic:EPIC-02`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-02.F2.S1.T2 — UpdateChannelConfigUseCase
**Descrição**: editar configuração de canal existente.
**Objetivo**: implementar edição de RF-06 (vídeos/dia, horários, plataformas, thumbnail, prompt override).
**Motivação**: configuração do canal muda com o tempo (usuário testa cadência, ajusta plataformas) — sem edição, cada mudança exigiria recriar o canal e perder histórico.
**Arquivos envolvidos**: `apps/api/src/application/use-cases/channel-management/UpdateChannelConfigUseCase.ts`.
**Critérios de aceite**: conforme [api/channels-api.md](../../api/channels-api.md).
**Critérios de teste**: integração (edição não afeta lote já disparado; `nicheId` não editável retorna erro).
**Checklist**: [ ] evento `ChannelConfigUpdated` publicado para o Scheduler Worker.
**Dependências**: ISSUE-02.F2.S1.T1.
**Labels**: `epic:EPIC-02`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-02.F2.S1.T3 — Pausar/retomar/remover canal
**Descrição**: implementar RF-14 no nível de canal.
**Objetivo**: permitir controle de qual canal está gerando conteúdo sem perder histórico.
**Motivação**: usuário precisa poder pausar um canal sem afetar os demais nem cancelar toda a conta (retenção de cliente).
**Arquivos envolvidos**: `apps/api/src/application/use-cases/channel-management/PauseChannelUseCase.ts`, controllers.
**Critérios de aceite**: conforme [api/channels-api.md](../../api/channels-api.md); job em andamento não é interrompido; `ACTIVE` exige `IsChannelReadyToPublishSpecification`.
**Critérios de teste**: unitário (transições válidas); integração (pausa não afeta job já enfileirado; `ACTIVE` bloqueado sem contas conectadas).
**Checklist**: [ ] histórico de `GeneratedVideo` preservado ao remover canal.
**Dependências**: ISSUE-02.F2.S1.T1, EPIC-04.
**Labels**: `epic:EPIC-02`, `type:feature`, `layer:api`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).
