# Domain Services e Application Services

> Revisado após [ADR-0011](../adr/0011-channel-as-aggregate.md), [ADR-0012](../adr/0012-batch-generation-delayed-publish.md), [ADR-0013](../adr/0013-thumbnail-frame-extraction.md), [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md).

## Diferença aplicada neste projeto

- **Domain Service**: regra de negócio que não pertence naturalmente a uma única entidade, sem I/O, pura (ex.: comparar dois trechos de vídeo para decidir diversidade). Vive em `domain/services`.
- **Application Service (Use Case)**: orquestra um caso de uso completo — chama domínio, repositórios (via interface), publica eventos/jobs. É a única camada que conhece transação e I/O (através de interfaces). Vive em `application/use-cases`.

## Domain Services

| Domain Service | Contexto | Responsabilidade |
|---|---|---|
| `HighlightDiversityService` | Content Generation | Dado um `SourceVideo` e a lista de `HighlightSelection` já usados por outros canais, calcula se uma nova seleção é suficientemente diversa (não sobreposição > 40% do tempo) |
| `PlanLimitsCalculator` | Subscription & Billing | Calcula limites efetivos restantes (canais, vídeos/dia por canal) dado plano + uso atual |
| `PublishSlotAllocator` | Channel Management | Distribui `videosPerDay` ao longo de uma janela padrão quando o usuário não customiza `publishTimes` explicitamente (RF-06) |
| `VideoQualityGate` | Content Generation | Aplica regras mínimas de qualidade (duração do highlight, presença de legenda) antes de permitir transição para `READY_TO_PUBLISH` |
| `ChannelLearningService` | Channel Management | Calcula `ChannelInsights` a partir de uma série de `AnalyticsSnapshot` (melhores horários, padrões de título, hashtags, duração ideal) — ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md) |
| `ThumbnailFrameSelector` | Content Generation | Escolhe o frame de maior nitidez dentre os amostrados na detecção de foco, para uso como thumbnail (ver [ADR-0013](../adr/0013-thumbnail-frame-extraction.md)) |

Nenhum Domain Service depende de repositório ou de SDK externo — recebe os dados já carregados como parâmetro (mantém testabilidade pura — RNF-30).

## Application Services (Use Cases)

| Use Case | Contexto | Orquestra |
|---|---|---|
| `RegisterTenantUseCase` | Identity & Access | `TenantFactory`, `UserRepository`, `TenantRepository`, emite `TenantCreated` |
| `InviteMemberUseCase` | Identity & Access | Valida papel do solicitante, `TenantRepository`, envia convite |
| `CreateChannelUseCase` | Channel Management | `PlanLimitsCalculator`, `NicheRepository`, `PublishSlotAllocator`, `ChannelFactory`, `ChannelRepository`, emite `ChannelCreated` |
| `UpdateChannelConfigUseCase` | Channel Management | Atualiza `videosPerDay`/`publishTimes`/`generationTime`/`platforms`, valida limites, emite `ChannelConfigUpdated` |
| `ConnectSocialAccountUseCase` | Channel Management | Troca código OAuth por token, `SocialAccountFactory`, `SocialAccountRepository`, `ChannelRepository` (avalia transição `DRAFT`→`ACTIVE`), emite `SocialAccountConnected` |
| `RefreshSocialAccountTokenUseCase` | Channel Management | Renova access token via refresh token de forma automática/periódica; emite `SocialAccountNeedsReauth` apenas se o refresh falhar |
| `TriggerDailyGenerationUseCase` | Channel Management → Content Generation | Disparado pelo Scheduler Worker no `generationTime` do canal; verifica `IsChannelReadyToPublishSpecification`, aloca `scheduledPublishAt` por vídeo via `publishTimes`, `GeneratedVideoFactory`, emite N eventos `GenerationScheduled` (um por vídeo do lote) |
| `GenerateVideoContentUseCase` | Content Generation | `TranscriptionProvider`, `AiCompletionProvider`, `HighlightDiversityService`, `VideoQualityGate`, `ChannelInsightsRepository` (contexto adicional), `GeneratedVideoRepository`, emite `VideoContentGenerated`/`VideoFlaggedForModeration` |
| `CutVideoUseCase` | Content Generation | `VideoProcessingService` (FFmpeg/OpenCV), `ThumbnailFrameSelector`, `GeneratedVideoRepository`, agenda job de publicação com delay até `scheduledPublishAt`, emite `VideoReadyToPublish` |
| `PublishVideoUseCase` | Publishing | `SocialPlatformPublisher` (por plataforma), `PublishRecordRepository`, faz fan-out para as duas plataformas quando `Channel.platforms = BOTH`, emite `VideoPublished`/`VideoPublishFailed` |
| `CollectAnalyticsUseCase` | Analytics | `SocialPlatformAnalyticsReader`, `AnalyticsSnapshotRepository`, emite `AnalyticsSnapshotCollected` |
| `UpdateChannelInsightsUseCase` | Channel Management | `AnalyticsSnapshotRepository` (leitura), `ChannelLearningService`, `ChannelInsightsRepository`, emite `ChannelInsightsUpdated` |
| `SendNotificationUseCase` | Notification | `NotificationPreferenceRepository`, `EmailSender`, `NotificationRepository` |
| `ReviewFlaggedVideoUseCase` | Content Generation (admin) | Aprova/rejeita `GeneratedVideo` em `PENDING_MODERATION` |
| `CurateSourceVideoUseCase` | Content Catalog (admin) | Ingesta e aprovação de `SourceVideo` com `LicenseInfo` obrigatório |

## Regra de camada (reforço SRP/DIP)

Um Use Case **nunca**:
- Importa Prisma, SDK do Whisper/Claude/OpenAI/YouTube/TikTok diretamente — sempre via interface injetada.
- Contém lógica condicional de regra de negócio complexa que deveria estar em um Domain Service ou na própria Entity (ex.: validação de invariante pertence à Entity, não ao Use Case).
- Chama outro Use Case diretamente — comunicação entre Use Cases de contextos diferentes é sempre por evento de domínio.
