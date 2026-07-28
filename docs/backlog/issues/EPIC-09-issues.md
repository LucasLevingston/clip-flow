# Issues — EPIC-09 Dashboard, Analytics & Aprendizado

> Revisado após [ADR-0011](../../adr/0011-channel-as-aggregate.md) (visão por canal) e [ADR-0014](../../adr/0014-learning-loop-prompt-augmentation.md) (loop de aprendizado).

---

### ISSUE-09.F1.S1.T1 — SocialPlatformAnalyticsReader (YouTube + TikTok)
**Descrição**: leitura normalizada de métricas de desempenho.
**Objetivo**: base de dados para o dashboard de métricas e para o loop de aprendizado.
**Motivação**: sem métrica, o usuário não sabe se o produto está gerando resultado — risco direto de churn; e sem métrica não há dado para `ChannelInsights`.
**Arquivos envolvidos**: `apps/workers/src/analytics/infrastructure/adapters/*.ts`.
**Critérios de aceite**: retorna `{ views, likes, comments, shares, retentionRate, ctr }` normalizado.
**Critérios de teste**: unitário (normalização); integração em modo teste.
**Checklist**: [ ] `externalPostId` não encontrado tratado sem exceção não capturada.
**Dependências**: EPIC-07.
**Labels**: `epic:EPIC-09`, `type:feature`, `layer:worker`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-09.F1.S1.T2 — CollectAnalyticsUseCase + repeatable job
**Descrição**: coleta periódica por 30 dias após publicação.
**Objetivo**: manter métricas atualizadas sem custo indefinido de chamadas de API.
**Motivação**: RF-13 exige atualização periódica; RNF-21 exige que isso não vire custo sem limite.
**Arquivos envolvidos**: `apps/workers/src/analytics/application/use-cases/CollectAnalyticsUseCase.ts`.
**Critérios de aceite**: para de reagendar após 30 dias ou post indisponível.
**Critérios de teste**: unitário (reagendamento); integração (ciclo completo simulado).
**Checklist**: [ ] falha de coleta nunca altera estado de publicação.
**Dependências**: ISSUE-09.F1.S1.T1.
**Labels**: `epic:EPIC-09`, `type:feature`, `layer:worker`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-09.F1.S1.T3 — ChannelLearningService + UpdateChannelInsightsUseCase
**Descrição**: recálculo diário de `ChannelInsights` a partir do histórico de métricas do canal.
**Objetivo**: implementar RF-17 (loop de aprendizado).
**Motivação**: é o diferencial competitivo declarado do produto ("a IA aprende continuamente") — sem isso, o produto é apenas automação estática, sem melhoria ao longo do tempo.
**Arquivos envolvidos**: `apps/workers/src/analytics/domain/services/ChannelLearningService.ts`, `apps/workers/src/analytics/application/use-cases/UpdateChannelInsightsUseCase.ts`.
**Critérios de aceite**: `ChannelInsights` sempre reconstruível a partir de `AnalyticsSnapshot`; canal sem histórico não gera erro; roda antes do `generationTime` do canal.
**Critérios de teste**: unitário do `ChannelLearningService` (dataset controlado); integração (canal sem histórico pulado corretamente).
**Checklist**: [ ] ordem de execução (antes do lote diário) garantida.
**Dependências**: ISSUE-09.F1.S1.T2.
**Labels**: `epic:EPIC-09`, `type:feature`, `layer:worker`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-09.F2.S1.T1 — Listagem de canais com resumo (Frontend)
**Descrição**: tela inicial do dashboard, um card por canal.
**Objetivo**: dar visão consolidada de todos os canais do tenant.
**Motivação**: usuário com múltiplos canais (persona "Estúdio Nova") precisa entender o estado de todos de relance, sem entrar em cada um.
**Arquivos envolvidos**: `apps/web/src/features/channels/components/ChannelList/*`, `useChannels.ts`.
**Critérios de aceite**: lista todos os canais do tenant com status visual claro.
**Critérios de teste**: RTL + MSW (lista, estado vazio, CTA de criar primeiro canal).
**Checklist**: [ ] Server Component onde possível.
**Dependências**: EPIC-02.F2.
**Labels**: `epic:EPIC-09`, `type:feature`, `layer:frontend`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-09.F2.S1.T2 — Lista de vídeos gerados com filtros por canal (Frontend)
**Descrição**: UI de histórico de vídeos, escopada por canal.
**Objetivo**: implementar a tela de detalhe de canal (RF-13).
**Motivação**: é a tela que o usuário mais visita — primeira impressão de "o produto está funcionando" para aquele canal específico.
**Arquivos envolvidos**: `apps/web/src/features/videos/components/VideoList/*`, `useVideos.ts`, `index.ts`.
**Critérios de aceite**: filtros e paginação funcionam dentro do escopo do canal.
**Critérios de teste**: RTL + MSW (renderização, filtro, estado vazio).
**Checklist**: [ ] nenhum fetch manual em `useEffect`.
**Dependências**: ISSUE-09.F2.S1.T1.
**Labels**: `epic:EPIC-09`, `type:feature`, `layer:frontend`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-09.F2.S1.T3 — Gráfico de métricas e resumo por canal (Frontend)
**Descrição**: visualização de métricas agregadas e série temporal do canal.
**Objetivo**: dar visibilidade de desempenho ao usuário de forma visual.
**Motivação**: número bruto sem visualização não comunica tendência — usuário precisa ver "este canal está crescendo".
**Arquivos envolvidos**: `apps/web/src/features/analytics/components/*`, `useAnalyticsSummary.ts`.
**Critérios de aceite**: gráfico renderiza série real; skeleton de loading.
**Critérios de teste**: RTL + MSW (dados, loading, erro).
**Checklist**: [ ] paleta acessível [ ] tabela alternativa de acessibilidade.
**Dependências**: ISSUE-09.F2.S1.T2.
**Labels**: `epic:EPIC-09`, `type:feature`, `layer:frontend`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-09.F2.S1.T4 — Painel de ChannelInsights (Frontend)
**Descrição**: mostra ao usuário o que a IA está aprendendo do canal.
**Objetivo**: implementar RF-17 no frontend — transparência do loop de aprendizado.
**Motivação**: um recurso de "IA que aprende" sem visibilidade nenhuma parece mágica não confiável — mostrar os insights concretos constrói confiança no produto.
**Arquivos envolvidos**: `apps/web/src/features/channels/components/ChannelInsightsPanel/*`.
**Critérios de aceite**: exibe melhores horários/padrões/hashtags/duração quando disponíveis; estado vazio (204) tratado com mensagem explicativa.
**Critérios de teste**: RTL + MSW (com insights, sem insights/204, erro).
**Checklist**: [ ] nenhum spinner infinito em resposta 204.
**Dependências**: ISSUE-09.F1.S1.T3.
**Labels**: `epic:EPIC-09`, `type:feature`, `layer:frontend`, `priority:P2`.
**Prioridade**: P2. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-09.F2.S1.T5 — Exportação CSV (Frontend)
**Descrição**: botão de exportação de histórico filtrado.
**Objetivo**: implementar RF-13 (exportação).
**Motivação**: agências (persona "Estúdio Nova") precisam de relatório para repassar a clientes.
**Arquivos envolvidos**: `apps/web/src/features/videos/components/ExportButton/*`.
**Critérios de aceite**: CSV baixado contém colunas documentadas.
**Critérios de teste**: RTL + MSW (clique dispara requisição correta).
**Checklist**: [ ] botão desabilitado durante exportação em andamento.
**Dependências**: ISSUE-09.F2.S1.T2.
**Labels**: `epic:EPIC-09`, `type:feature`, `layer:frontend`, `priority:P2`.
**Prioridade**: P2. **Complexidade**: Baixa. **Tempo estimado**: 1 dia (2 pontos).
