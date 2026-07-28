# Analytics Worker

## Responsabilidade
Coletar periodicamente métricas de desempenho de cada `PublishRecord` durante os primeiros 30 dias após publicação, e recalcular diariamente `ChannelInsights` a partir desse histórico (RF-17 — ver [architecture/analytics-flow.md](../architecture/analytics-flow.md), [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)).

## Entradas
- Job da fila `analytics`, payload: `{ publishRecordId, traceId }`, disparado por `VideoPublished` (primeira coleta em +6h) e depois por repeatable job a cada 6h.
- Lê de banco: `PublishRecord` (plataforma, `externalPostId`).

## Saídas
- Cria `AnalyticsSnapshot` (append-only).
- Evento `AnalyticsSnapshotCollected` (consumo interno, sem downstream crítico).

## Fila
- Consome: `analytics`
- Produz: nenhuma fila downstream de negócio (apenas reagenda a si mesma via repeatable job)

## Eventos
- Consumido: `VideoPublished` (agenda primeira coleta)
- Publicado: `AnalyticsSnapshotCollected`

## Tratamento de erros
| Erro | Ação |
|---|---|
| Plataforma indisponível/rate limit | Retry com backoff; se esgotar, pula este ciclo — não bloqueia próximos ciclos nem afeta o vídeo publicado |
| `externalPostId` não encontrado (post removido pelo usuário na plataforma) | Marca coleta como `UNAVAILABLE`, para de reagendar para este `PublishRecord` |

## Retries
3 tentativas, backoff exponencial base 15s. Baixa criticidade — falha aqui nunca afeta o pipeline de publicação (RNF-16).

## Timeout
30 segundos por job (chamada de leitura simples às APIs de plataforma).

## Janela ativa
30 dias após `publishedAt`; após esse período, o repeatable job de coleta para automaticamente para aquele `PublishRecord` (reduz custo de chamadas de API — RNF-21).

## Recálculo de `ChannelInsights`

Repeatable job diário adicional (por canal, agendado pouco antes do `generationTime` do respectivo canal): executa `UpdateChannelInsightsUseCase`, lendo `AnalyticsSnapshot` do canal via `AnalyticsSnapshotRepository.findByChannelId` e aplicando `ChannelLearningService`. Canal sem histórico suficiente (`HasSufficientHistoryForInsightsSpecification`) é pulado sem erro. Emite `ChannelInsightsUpdated` ao concluir. Ver [domain/policies-specifications.md](../domain/policies-specifications.md) e [architecture/analytics-flow.md](../architecture/analytics-flow.md).
