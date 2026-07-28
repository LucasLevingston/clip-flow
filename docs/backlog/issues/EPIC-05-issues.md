# Issues — EPIC-05 Configuração de Publicação do Canal

> Reescrito após [ADR-0011](../../adr/0011-channel-as-aggregate.md)/[ADR-0012](../../adr/0012-batch-generation-delayed-publish.md) — agenda agora é campo de `Channel` (domínio/API em EPIC-02); aqui ficam a reação do Scheduler Worker e a UI.

---

### ISSUE-05.F1.S1.T1 — Handlers de ChannelCreated/ChannelConfigUpdated/ChannelPaused/ChannelResumed no Scheduler Worker
**Descrição**: manter repeatable jobs do BullMQ sincronizados com o estado de cada canal.
**Objetivo**: garantir que o disparo diário sempre reflete a configuração atual do canal.
**Motivação**: é o elo entre "usuário configurou o canal" e "o sistema realmente executa isso todo dia" — sem sincronização correta, mudanças de configuração seriam ignoradas silenciosamente.
**Arquivos envolvidos**: `apps/workers/src/scheduler/application/use-cases/SyncChannelScheduleUseCase.ts`, `apps/workers/src/scheduler/main.ts`.
**Critérios de aceite**: repeatable job sempre reflete o `generationTime` atual; canal pausado não dispara lote.
**Critérios de teste**: integração com Redis efêmero — criar/editar/pausar canal e verificar repeatable job registrado/atualizado/removido corretamente.
**Checklist**: [ ] idempotente — reprocessar o mesmo evento não duplica repeatable job.
**Dependências**: EPIC-02.F2, EPIC-00.F3.S1.T3.
**Labels**: `epic:EPIC-05`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-05.F2.S1.T1 — Wizard de criação de canal (Frontend)
**Descrição**: UI de criação de canal (nicho, nome, idioma, vídeos/dia, horários, plataformas, thumbnail).
**Objetivo**: implementar a UI de RF-04/RF-06.
**Motivação**: é a primeira ação de valor real do usuário no produto (UC03) — a qualidade dessa UI define a primeira impressão do produto inteiro.
**Arquivos envolvidos**: `apps/web/src/features/channels/components/CreateChannelWizard/*`, `apps/web/src/features/channels/hooks/useCreateChannel.ts`, `apps/web/src/features/channels/index.ts`.
**Critérios de aceite**: fluxo completo de criação funcional; erros de limite de plano exibidos com CTA de upgrade.
**Critérios de teste**: RTL + MSW (cada passo do wizard, submissão, erro de limite de plano).
**Checklist**: [ ] nenhum fetch manual em `useEffect` [ ] formulário acessível.
**Dependências**: EPIC-02.F2.S1.T1, EPIC-02.F1.S1.T1.
**Labels**: `epic:EPIC-05`, `type:feature`, `layer:frontend`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-05.F2.S1.T2 — Tela de edição de configuração do canal (Frontend)
**Descrição**: UI de edição (vídeos/dia, horários, plataformas, thumbnail, prompt override) e pausar/retomar.
**Objetivo**: permitir ajuste contínuo da configuração sem recriar o canal.
**Motivação**: usuário vai iterar na cadência/plataformas conforme aprende o que funciona — precisa ser tão fácil quanto criar.
**Arquivos envolvidos**: `apps/web/src/features/channels/components/ChannelSettingsForm/*`.
**Critérios de aceite**: edição reflete no próximo lote, aviso claro de que não afeta o lote em andamento.
**Critérios de teste**: RTL + MSW (edição, pausa, retomada, erro de canal não pronto para `ACTIVE`).
**Checklist**: [ ] campo de nicho desabilitado/somente leitura.
**Dependências**: ISSUE-05.F2.S1.T1.
**Labels**: `epic:EPIC-05`, `type:feature`, `layer:frontend`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).
