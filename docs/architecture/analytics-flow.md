# Fluxo de Analytics

## Objetivo
Coletar periodicamente métricas de desempenho (views, likes, comentários, compartilhamentos, retenção, CTR) de cada `PublishRecord`, alimentando o dashboard do tenant (RF-13) e o recálculo periódico de `ChannelInsights` (RF-17 — ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)).

```mermaid
sequenceDiagram
  participant AnalyticsQ as Fila: analytics
  participant Analytics as Analytics Worker
  participant DB as Banco
  participant YT as YouTube API
  participant TT as TikTok API

  Note over AnalyticsQ: Job agendado no VideoPublished (+6h) e depois repeatable (a cada 6h por até 30 dias)
  AnalyticsQ->>Analytics: CollectAnalytics(publishRecordId)
  Analytics->>DB: Carrega PublishRecord (plataforma, externalPostId)
  alt Plataforma = YouTube
    Analytics->>YT: getVideoStats(externalPostId)
  else Plataforma = TikTok
    Analytics->>TT: getVideoStats(externalPostId)
  end
  alt Sucesso
    YT-->>Analytics: {views, likes, comments}
    TT-->>Analytics: {views, likes, comments}
    Analytics->>DB: Cria AnalyticsSnapshot(publishRecordId, metrics, collectedAt)
  else Falha (plataforma indisponível/quota)
    Analytics->>Analytics: Retry com backoff; se esgotar, pula este ciclo (não bloqueia próximos)
  end
  Analytics->>Analytics: Se PublishRecord tem < 30 dias, reagenda próxima coleta em +6h
```

## Regras

- Janela de coleta ativa: **30 dias** após publicação (RNF do RF-13); após isso, snapshot final permanece no histórico, mas coleta periódica cessa (reduz custo de chamadas de API).
- Falha de coleta **nunca** afeta o estado do `GeneratedVideo`/`PublishRecord` de publicação — analytics é estritamente downstream e não-crítico ao pipeline principal (RNF-16).
- `AnalyticsSnapshot` é append-only (série temporal) — nunca sobrescreve snapshot anterior, permitindo gráfico de evolução no dashboard.

## Recálculo de `ChannelInsights` (loop de aprendizado — RF-17)

Diariamente, antes do `generationTime` de cada canal, o Analytics Worker executa `UpdateChannelInsightsUseCase`: lê o histórico de `AnalyticsSnapshot` dos vídeos do canal (via `AnalyticsSnapshotRepository.findByChannelId`), aplica `ChannelLearningService` (melhores horários por engajamento, padrões de título/hashtags associados a bom desempenho, duração média dos vídeos com melhor retenção) e grava/atualiza `ChannelInsights` (upsert — sempre substitui o cálculo anterior). Canal sem `AnalyticsSnapshot` suficiente (`HasSufficientHistoryForInsightsSpecification`) simplesmente não tem `ChannelInsights` produzido neste ciclo — não é erro, é estado normal de canal novo. Este passo roda **antes** do Scheduler disparar o lote do dia (ver [scheduler-flow.md](scheduler-flow.md)), garantindo que o AI Worker sempre tenha acesso ao insight mais recente disponível.
