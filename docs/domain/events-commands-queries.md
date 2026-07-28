# Events, Commands e Queries

> Revisado após [ADR-0011](../adr/0011-channel-as-aggregate.md) e [ADR-0012](../adr/0012-batch-generation-delayed-publish.md).

Convenção CQS aplicada nos Application Services: um Use Case ou é um **Command** (muda estado, não retorna dados de domínio além de IDs/status) ou é uma **Query** (lê dados, nunca muda estado). Nenhum Use Case faz as duas coisas.

## Commands

| Command | Use Case correspondente | Efeito colateral |
|---|---|---|
| `RegisterTenant` | `RegisterTenantUseCase` | Cria Tenant/User/Membership/Subscription; emite `TenantCreated` |
| `InviteMember` | `InviteMemberUseCase` | Envia convite; sem evento de domínio (efeito é e-mail direto) |
| `CreateChannel` | `CreateChannelUseCase` | Cria `Channel` em `DRAFT`; emite `ChannelCreated` |
| `UpdateChannelConfig` | `UpdateChannelConfigUseCase` | Atualiza configuração de geração/publicação; emite `ChannelConfigUpdated` |
| `PauseChannel` / `ResumeChannel` | `PauseChannelUseCase` | Atualiza `Channel.status`; emite `ChannelPaused`/`ChannelResumed` |
| `ConnectSocialAccount` | `ConnectSocialAccountUseCase` | Cria `SocialAccount`; emite `SocialAccountConnected`; pode emitir `ChannelActivated` |
| `TriggerDailyGeneration` | `TriggerDailyGenerationUseCase` | Cria N `GeneratedVideo` (um lote); emite N `GenerationScheduled` |
| `GenerateVideoContent` | `GenerateVideoContentUseCase` | Atualiza `GeneratedVideo`; emite `VideoContentGenerated` ou `VideoFlaggedForModeration` |
| `CutVideo` | `CutVideoUseCase` | Atualiza `GeneratedVideo`; agenda publicação com delay; emite `VideoReadyToPublish` |
| `PublishVideo` | `PublishVideoUseCase` | Cria 1 ou 2 `PublishRecord` (fan-out se `platforms = BOTH`); emite `VideoPublished` ou `VideoPublishFailed` |
| `CollectAnalytics` | `CollectAnalyticsUseCase` | Cria `AnalyticsSnapshot`; emite `AnalyticsSnapshotCollected` |
| `UpdateChannelInsights` | `UpdateChannelInsightsUseCase` | Recalcula `ChannelInsights`; emite `ChannelInsightsUpdated` |
| `ReviewFlaggedVideo` | `ReviewFlaggedVideoUseCase` | Atualiza `GeneratedVideo`; emite `VideoContentGenerated` (se aprovado) |
| `CurateSourceVideo` | `CurateSourceVideoUseCase` | Cria/atualiza `SourceVideo` |
| `ChangePlan` | `ChangePlanUseCase` | Atualiza `Subscription`; valida downgrade (RF-08) |

## Queries

| Query | Retorno | Uso |
|---|---|---|
| `GetNicheCatalog` | Lista de `Niche` ativos | Tela de criação de canal (RF-03) |
| `GetChannelsByTenant` | Lista de `Channel` com resumo de status | Dashboard principal (RF-13) |
| `GetChannelDashboard` | Vídeos do canal + status + métricas resumidas | Painel do canal (RF-13) |
| `GetGeneratedVideoHistory` | Lista paginada/filtrável de `GeneratedVideo`+`PublishRecord` | Histórico por canal |
| `GetSocialAccountsByChannel` | Lista de `SocialAccount` do canal | Tela de contas conectadas do canal |
| `GetPlanLimitsUsage` | Limites vs. uso atual (canais, vídeos/dia) | Tela de billing/upgrade |
| `GetPendingModerationQueue` | Lista de `GeneratedVideo` em `PENDING_MODERATION` | Admin console |
| `GetPlatformHealthStatus` | Status de filas/workers/integrações | Admin console (RF-16) |
| `GetChannelInsights` | `ChannelInsights` mais recente do canal | Painel do canal (transparência do que a IA está usando) |

Queries **não** passam pela mesma pilha de repositórios de escrita quando a leitura é complexa/agregada (ex.: dashboard com joins e métricas) — usam um `ReadModel`/projeção otimizada (view ou query SQL dedicada), mantendo o Aggregate de escrita simples (CQRS leve, sem event sourcing).

## Eventos de Domínio

Catálogo completo, produtores e consumidores documentados em [architecture/event-flow.md](../architecture/event-flow.md). Regra de nomenclatura: eventos são sempre **fato passado** (`VideoPublished`, não `PublishVideo`); comandos são sempre **imperativo** (`PublishVideo`, não `VideoPublished`).
