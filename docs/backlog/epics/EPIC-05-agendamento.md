# EPIC-05 — Configuração de Publicação do Canal

Cobre RF-06, RF-14. Complementa EPIC-02 (que cobre domínio/API de `Channel`): aqui entram a reação do Scheduler Worker às mutações de canal e a UI de configuração — ver [ADR-0011](../../adr/0011-channel-as-aggregate.md), [ADR-0012](../../adr/0012-batch-generation-delayed-publish.md).

## Feature EPIC-05.F1 — Registro de Repeatable Jobs por Canal

### História EPIC-05.F1.S1 — Scheduler Worker reage a mutações de canal

**EPIC-05.F1.S1.T1 — Handlers de `ChannelCreated`/`ChannelConfigUpdated`/`ChannelPaused`/`ChannelResumed` no Scheduler Worker**
- Objetivo: manter os repeatable jobs do BullMQ sincronizados com o estado atual de cada `Channel` (ver [architecture/scheduler-flow.md](../../architecture/scheduler-flow.md)).
- Descrição: ao consumir `ChannelCreated`/`ChannelActivated`, registra repeatable job no `generationTime` do canal; ao consumir `ChannelConfigUpdated` (mudança de `generationTime`), remove e recria o job; ao consumir `ChannelPaused`/remoção, remove o repeatable job.
- Arquivos: `apps/workers/src/scheduler/application/use-cases/SyncChannelScheduleUseCase.ts`, `apps/workers/src/scheduler/main.ts`.
- Dependências: EPIC-02.F2 (eventos de canal), EPIC-00.F3.S1.T3 (Redis).
- Critérios de aceite: repeatable job sempre reflete o `generationTime` atual do canal; canal pausado não dispara lote.
- Testes obrigatórios: integração com Redis efêmero — criar/editar/pausar canal e verificar repeatable job registrado/atualizado/removido corretamente.
- Estimativa: 5 pontos.
- Checklist: [ ] idempotente — reprocessar o mesmo evento não duplica repeatable job.

## Feature EPIC-05.F2 — UI de Configuração do Canal (Frontend)

### História EPIC-05.F2.S1 — Wizard de criação e tela de edição

**EPIC-05.F2.S1.T1 — Feature `channels` — wizard de criação de canal**
- Objetivo: implementar UI de RF-04/RF-06 (criação: nicho, nome, idioma, vídeos/dia, horários, plataformas, thumbnail).
- Descrição: componente `CreateChannelWizard` (múltiplos passos), hook `useCreateChannel` (TanStack Query mutation) consumindo [api/channels-api.md](../../api/channels-api.md); validação com Zod espelhando as regras da API.
- Arquivos: `apps/web/src/features/channels/components/CreateChannelWizard/*`, `apps/web/src/features/channels/hooks/useCreateChannel.ts`, `apps/web/src/features/channels/index.ts`.
- Dependências: EPIC-02.F2.S1.T1, EPIC-02.F1.S1.T1 (catálogo de nichos para o seletor).
- Critérios de aceite: fluxo completo de criação funcional; erros de limite de plano exibidos com CTA de upgrade.
- Testes obrigatórios: RTL + MSW (cada passo do wizard, submissão, erro de limite de plano).
- Estimativa: 8 pontos.
- Checklist: [ ] nenhum fetch manual em `useEffect` [ ] formulário acessível (labels, foco, mensagens de erro associadas ao campo).

**EPIC-05.F2.S1.T2 — Tela de edição de configuração do canal**
- Objetivo: implementar UI de edição (vídeos/dia, horários, plataformas, thumbnail, prompt override) e pausar/retomar.
- Descrição: componente `ChannelSettingsForm`, reaproveita validação Zod do wizard.
- Arquivos: `apps/web/src/features/channels/components/ChannelSettingsForm/*`.
- Dependências: EPIC-05.F2.S1.T1.
- Critérios de aceite: edição reflete no próximo lote, aviso claro de que não afeta o lote em andamento.
- Testes obrigatórios: RTL + MSW (edição, pausa, retomada, erro de canal não pronto para `ACTIVE`).
- Estimativa: 5 pontos.
- Checklist: [ ] campo de nicho desabilitado/somente leitura (imutável após criação).
