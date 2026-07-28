# Policies e Specifications

> Revisado após [ADR-0011](../adr/0011-channel-as-aggregate.md) e [ADR-0012](../adr/0012-batch-generation-delayed-publish.md).

## Policies

Uma Policy encapsula uma regra de decisão de negócio que pode variar (ex.: por plano, por configuração), mantendo o Aggregate/Use Case livre de `if` espalhados.

| Policy | Regra encapsulada |
|---|---|
| `PlanLimitsPolicy` | Decide se uma ação (criar canal, aumentar vídeos/dia) é permitida dado o plano atual e uso corrente do tenant (RF-08) |
| `HighlightDiversityPolicy` | Decide se uma nova seleção de trecho é suficientemente diferente das já usadas para o mesmo `SourceVideo` por outros canais (ver [ADR-0006](../adr/0006-content-source-strategy.md)) |
| `ContentModerationPolicy` | Decide se um `GeneratedVideo` deve ir para `PENDING_MODERATION` com base em sinalizadores retornados pela IA (FA3) |
| `RetryPolicy` | Define número de tentativas e backoff por tipo de worker/integração (RNF-32) — parametrizada por worker (ver [architecture/worker-flow.md](../architecture/worker-flow.md)) |
| `TokenRefreshPolicy` | Decide quando renovar proativamente um access token (ex.: faltando < 10 min para expirar) e quando uma falha de refresh deve virar `NEEDS_REAUTH` (FA2) |
| `AiProviderFallbackPolicy` | Decide quando migrar de Claude (primário) para OpenAI (fallback) — erro, timeout, ou limite de custo excedido (ver [ADR-0008](../adr/0008-ai-provider-strategy-claude-openai.md)) |

Toda Policy é uma classe/função pura (`domain/policies`), testável sem I/O — recebe estado já carregado e retorna decisão (`boolean`/enum), nunca executa a ação em si.

## Specifications

Specification encapsula um predicado de negócio reutilizável e combinável, usado tanto para validação em memória quanto para tradução em filtro de query (quando aplicável).

| Specification | Predicado |
|---|---|
| `IsSourceVideoAvailableForChannelSpecification` | `SourceVideo.status == APPROVED` **e** não existe `GeneratedVideo` prévio para este `(channelId, sourceVideoId)` |
| `IsChannelReadyToPublishSpecification` | Para cada plataforma em `Channel.platforms`, existe `SocialAccount` `CONNECTED` correspondente (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)) |
| `IsSubscriptionActiveSpecification` | `Subscription.status ∈ {TRIAL, ACTIVE}` |
| `IsGeneratedVideoDuplicateSpecification` | Já existe `GeneratedVideo` com o mesmo par `(batchRunId, scheduledPublishAt)` (idempotência — RNF-34) |
| `HasSufficientHistoryForInsightsSpecification` | Canal tem `AnalyticsSnapshot` suficientes (ex.: ≥ 5 vídeos publicados) para `ChannelLearningService` produzir insights confiáveis |

Specifications compõem-se (`and`, `or`, `not`) para formar as pré-condições documentadas em [architecture/scheduler-flow.md](../architecture/scheduler-flow.md) sem duplicar a lógica em múltiplos Use Cases.
