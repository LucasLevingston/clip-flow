# AI Worker

## Responsabilidade
Transcrever o vídeo-fonte (com cache), selecionar o melhor trecho e gerar título/descrição/hashtags/CTA via IA generativa, aplicando diversidade entre canais e, quando disponível, contexto de `ChannelInsights` (ver [architecture/ai-flow.md](../architecture/ai-flow.md), [ADR-0008](../adr/0008-ai-provider-strategy-claude-openai.md), [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)).

## Entradas
- Job da fila `ai`, payload: `{ tenantId, channelId, batchRunId, scheduledPublishAt, traceId }`.
- Lê de banco: `SourceVideo` disponível (via `IsSourceVideoAvailableForChannelSpecification`), `Transcript` (cache), `Niche.activePromptTemplate`, `Channel.language`/`promptOverride`, `ChannelInsights` (se existir).

## Saídas
- Cria/atualiza `GeneratedVideo` (status `SOURCING` → `TRANSCRIBING` → `CONTENT_READY` ou `PENDING_MODERATION`).
- Cria `Transcript` se não existir cache.
- Evento `VideoContentGenerated` (fila `video`) ou `VideoFlaggedForModeration` (fila `notification`, admin).

## Fila
- Consome: `ai`
- Produz: `video`, `notification`

## Eventos
- Consumido: `GenerationScheduled`
- Publicado: `VideoContentGenerated`, `VideoFlaggedForModeration`, `VideoContentGenerationFailed`

## Tratamento de erros
| Erro | Ação |
|---|---|
| Whisper timeout/erro | Retry; após esgotar, `GeneratedVideo.status = FAILED`, `VideoContentGenerationFailed` |
| Claude indisponível/erro/timeout | Fallback automático para OpenAI (`AiProviderFallbackPolicy`) |
| OpenAI também falha | Retry com backoff; após esgotar, `FAILED` |
| Conteúdo sinalizado como sensível | Não é erro — transição para `PENDING_MODERATION` (fluxo normal, FA3) |

## Retries
5 tentativas, backoff exponencial base 5s, por etapa (transcrição e geração têm contadores de tentativa independentes dentro do mesmo job, para não re-transcrever ao falhar só a geração de copy).

## Timeout
Transcrição: 5 min. Seleção de highlight: 60s. Geração de copy: 30s. Job total: 6 min.

## Custo
Cada chamada a Whisper/Claude/OpenAI registra tokens/minutos consumidos, associados a `generatedVideoId`, agregados em métricas de custo (RNF-21/22 — ver [observability/observability.md](../observability/observability.md)).
