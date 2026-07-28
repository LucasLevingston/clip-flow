# EPIC-09 — Dashboard, Analytics & Aprendizado

Cobre RF-13, RF-17. Revisado após [ADR-0011](../../adr/0011-channel-as-aggregate.md) (visão por canal) e [ADR-0014](../../adr/0014-learning-loop-prompt-augmentation.md) (loop de aprendizado).

## Feature EPIC-09.F1 — Analytics Worker

### História EPIC-09.F1.S1 — Coleta periódica e aprendizado

**EPIC-09.F1.S1.T1 — `SocialPlatformAnalyticsReader` (YouTube + TikTok)**
- Objetivo: implementar leitura de métricas (ver [architecture/analytics-flow.md](../../architecture/analytics-flow.md)).
- Descrição: interface de domínio + 2 adapters (`YoutubeAnalyticsAdapter`, `TiktokAnalyticsAdapter`).
- Arquivos: `apps/workers/src/analytics/infrastructure/adapters/*.ts`.
- Dependências: EPIC-07.
- Critérios de aceite: retorna `{ views, likes, comments, shares, retentionRate, ctr }` normalizado, independente da plataforma.
- Testes obrigatórios: unitário (normalização); integração com API em modo teste.
- Estimativa: 5 pontos.
- Checklist: [ ] `externalPostId` não encontrado tratado sem lançar exceção não capturada.

**EPIC-09.F1.S1.T2 — `CollectAnalyticsUseCase` + repeatable job de 6h por 30 dias**
- Objetivo: orquestrar coleta periódica.
- Descrição: cria `AnalyticsSnapshot`, reagenda próxima coleta enquanto dentro da janela de 30 dias.
- Arquivos: `apps/workers/src/analytics/application/use-cases/CollectAnalyticsUseCase.ts`.
- Dependências: EPIC-09.F1.S1.T1.
- Critérios de aceite: para de reagendar após 30 dias ou após post `UNAVAILABLE`.
- Testes obrigatórios: unitário (lógica de reagendamento); integração (Redis efêmero, ciclo completo simulado).
- Estimativa: 5 pontos.
- Checklist: [ ] falha de coleta nunca altera `GeneratedVideo`/`PublishRecord`.

**EPIC-09.F1.S1.T3 — `ChannelLearningService` + `UpdateChannelInsightsUseCase` + repeatable job diário**
- Objetivo: implementar RF-17 — recálculo de `ChannelInsights` a partir do histórico de métricas do canal (ver [ADR-0014](../../adr/0014-learning-loop-prompt-augmentation.md)).
- Descrição: agrega `AnalyticsSnapshot` do canal (melhores horários, padrões de título, hashtags, duração ideal); roda diariamente antes do `generationTime` do canal; usa `HasSufficientHistoryForInsightsSpecification` para pular canais sem histórico suficiente.
- Arquivos: `apps/workers/src/analytics/domain/services/ChannelLearningService.ts`, `apps/workers/src/analytics/application/use-cases/UpdateChannelInsightsUseCase.ts`.
- Dependências: EPIC-09.F1.S1.T2 (precisa de `AnalyticsSnapshot` acumulado).
- Critérios de aceite: `ChannelInsights` sempre reconstruível a partir de `AnalyticsSnapshot`; canal sem histórico não gera erro; emite `ChannelInsightsUpdated`.
- Testes obrigatórios: unitário do `ChannelLearningService` (cálculo de melhores horários/padrões com dataset controlado); integração (repeatable job real, canal sem histórico é pulado corretamente).
- Estimativa: 8 pontos.
- Checklist: [ ] roda antes do `generationTime` do canal, não depois (ordem importa — ver [architecture/analytics-flow.md](../../architecture/analytics-flow.md)).

## Feature EPIC-09.F2 — Dashboard (Frontend)

### História EPIC-09.F2.S1 — Canais, histórico e métricas

**EPIC-09.F2.S1.T1 — Feature `channels` — listagem de canais com resumo**
- Objetivo: implementar a tela inicial do dashboard (RF-13).
- Descrição: página `(dashboard)/channels`, componente `ChannelList` com card por canal (status, nicho, plataformas, resumo de métricas), hook `useChannels` (TanStack Query) consumindo [api/channels-api.md](../../api/channels-api.md).
- Arquivos: `apps/web/src/features/channels/components/ChannelList/*`, `apps/web/src/features/channels/hooks/useChannels.ts`.
- Dependências: EPIC-02.F2.
- Critérios de aceite: lista todos os canais do tenant com status visual claro (DRAFT/ACTIVE/PAUSED).
- Testes obrigatórios: RTL + MSW (lista renderiza, estado vazio quando sem canais, CTA de criar primeiro canal).
- Estimativa: 3 pontos.
- Checklist: [ ] Server Component onde não há interatividade.

**EPIC-09.F2.S1.T2 — Feature `videos` — lista de vídeos gerados com filtros por canal**
- Objetivo: implementar UI de histórico (RF-13).
- Descrição: página `(dashboard)/channels/[channelId]/videos`, componentes `VideoList`, `VideoFilters`, hook `useVideos` (TanStack Query) consumindo [api/videos-api.md](../../api/videos-api.md).
- Arquivos: `apps/web/src/features/videos/components/VideoList/*`, `apps/web/src/features/videos/hooks/useVideos.ts`, `apps/web/src/features/videos/index.ts`.
- Dependências: EPIC-09.F2.S1.T1.
- Critérios de aceite: filtros por plataforma/status/período funcionam dentro do escopo do canal; paginação funcional.
- Testes obrigatórios: RTL + MSW (lista renderiza, filtro dispara nova query, estado vazio exibido corretamente).
- Estimativa: 5 pontos.
- Checklist: [ ] nenhum fetch manual em `useEffect`.

**EPIC-09.F2.S1.T3 — Feature `analytics` — gráfico de métricas e resumo por canal**
- Objetivo: implementar visualização de métricas agregadas do canal.
- Descrição: componentes de card de resumo (`AnalyticsSummary`) e gráfico de série temporal (`VideoMetricsChart`), consumindo [api/analytics-api.md](../../api/analytics-api.md).
- Arquivos: `apps/web/src/features/analytics/components/*`, `apps/web/src/features/analytics/hooks/useAnalyticsSummary.ts`.
- Dependências: EPIC-09.F2.S1.T2.
- Critérios de aceite: gráfico renderiza série real; skeleton de loading enquanto carrega (RNF-19/ver checklist visual v0).
- Testes obrigatórios: RTL + MSW (renderização com dados, estado de loading, estado de erro).
- Estimativa: 5 pontos.
- Checklist: [ ] cores de gráfico acessíveis (paleta com contraste adequado) [ ] tabela alternativa para acessibilidade.

**EPIC-09.F2.S1.T4 — Painel de `ChannelInsights` (transparência do aprendizado)**
- Objetivo: implementar RF-17 no frontend — mostrar ao usuário o que a IA está aprendendo do canal.
- Descrição: componente `ChannelInsightsPanel` consumindo `GET /v1/channels/:channelId/insights` (ver [api/channels-api.md](../../api/channels-api.md)); estado vazio claro para canal sem histórico suficiente.
- Arquivos: `apps/web/src/features/channels/components/ChannelInsightsPanel/*`.
- Dependências: EPIC-09.F1.S1.T3.
- Critérios de aceite: exibe melhores horários, padrões de título, hashtags e duração ideal quando disponíveis; estado vazio (204) tratado com mensagem explicativa, não como erro.
- Testes obrigatórios: RTL + MSW (com insights, sem insights/204, erro).
- Estimativa: 3 pontos.
- Checklist: [ ] nenhum spinner infinito quando resposta é 204 (vazio é um estado válido, não loading).

**EPIC-09.F2.S1.T5 — Exportação CSV**
- Objetivo: implementar exportação (RF-13).
- Descrição: botão de exportação chamando `GET /v1/videos/export` e disparando download no navegador.
- Arquivos: `apps/web/src/features/videos/components/ExportButton/*`.
- Dependências: EPIC-09.F2.S1.T2.
- Critérios de aceite: arquivo CSV baixado contém as colunas documentadas.
- Testes obrigatórios: RTL + MSW (clique dispara requisição correta com filtros aplicados).
- Estimativa: 2 pontos.
- Checklist: [ ] botão desabilitado durante exportação em andamento (RF de UX — loading-buttons).
