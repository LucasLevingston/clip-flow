# Aggregates, Repositories e Factories

> Revisado após [ADR-0011](../adr/0011-channel-as-aggregate.md) — `Channel` substitui `NicheSubscription`/`PublishSchedule` como unidade central de configuração.

## Aggregates

Um Aggregate agrupa entidades/VOs sob uma única raiz consistente transacionalmente. Toda mutação passa pela raiz — nunca se edita uma entidade filha diretamente de fora do aggregate.

| Aggregate Root | Entidades/VOs internos | Justificativa da fronteira |
|---|---|---|
| `Tenant` | `Membership[]` | Convites/remoções de membro sempre validam invariante "ao menos 1 OWNER" na raiz |
| `Niche` | `PromptTemplate[]` (referência, não composição forte) | `PromptTemplate` é editado via seu próprio caso de uso administrativo, mas versão ativa é lida a partir do `Niche` |
| `SourceVideo` | `LicenseInfo` | Aprovação (`APPROVED`) só é permitida com `LicenseInfo` válido — regra vive na raiz |
| `Subscription` | — | Consultada por `Channel` (via `PlanLimitsPolicy`) para validar limites; não compõe `Channel` |
| `Channel` | `publishTimes: TimeOfDay[]` | Raiz central: nicho, quantidade/horários de geração e publicação, plataformas — tudo protegido por invariantes únicas nesta raiz (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)) |
| `SocialAccount` | `EncryptedToken` | Aggregate Root próprio (referencia `channelId` por ID) — refresh de token e mudança de `status` acontecem sem precisar carregar o `Channel` inteiro |
| `GeneratedVideo` | `HighlightSelection`, `VideoCopy`, `Transcript` (referência por ID) | Raiz do pipeline: toda a máquina de estados do vídeo é protegida aqui (ver [domain/entities-value-objects.md](entities-value-objects.md)) |
| `PublishRecord` | — | Simples, mas isolado de `GeneratedVideo` para permitir N publicações (uma por plataforma) por vídeo |
| `AnalyticsSnapshot` | — | Append-only, sem necessidade de aggregate complexo |
| `Notification` | — | Simples |

`ChannelInsights` **não** é um Aggregate Root — é uma projeção de leitura recalculada periodicamente, sem invariante transacional própria (ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)).

## Regras gerais de aggregate

- Uma transação de banco nunca escreve em mais de um Aggregate Root ao mesmo tempo — comunicação entre aggregates é via evento de domínio (eventual consistency), exceto quando ambos pertencem à mesma operação atômica de negócio explicitamente modelada (ex.: criar `Tenant` + `Membership(OWNER)` no cadastro, que são o mesmo aggregate).
- Aggregates referenciam outros aggregates **apenas por ID** (ex.: `GeneratedVideo.channelId`, nunca um objeto `Channel` embutido).

## Repositories (interfaces de domínio)

| Repository | Métodos essenciais |
|---|---|
| `TenantRepository` | `findById`, `save` |
| `UserRepository` | `findById`, `findByEmail`, `save` |
| `NicheRepository` | `findActiveCatalog`, `findById`, `save` |
| `SourceVideoRepository` | `findApprovedUnusedByChannel(nicheId, channelId)`, `findById`, `save` |
| `SubscriptionRepository` | `findByTenantId`, `save` |
| `ChannelRepository` | `findByTenantId`, `findById`, `save` |
| `SocialAccountRepository` | `findByChannelId`, `findById`, `save` |
| `GeneratedVideoRepository` | `findById`, `findByBatchRunId`, `save` |
| `TranscriptRepository` | `findBySourceVideoId`, `save` |
| `PublishRecordRepository` | `findByGeneratedVideoAndAccount`, `save` |
| `AnalyticsSnapshotRepository` | `findByPublishRecordId`, `findByChannelId(since)`, `save` |
| `ChannelInsightsRepository` | `findByChannelId`, `save` (upsert — sempre substitui o cálculo anterior) |
| `NotificationRepository` | `findUnreadByUser`, `save` |

Todo repository é uma **interface** definida em `domain/`, implementada em `infrastructure/` via Prisma (ver [ADR-0004](../adr/0004-supabase-as-primary-db.md) e [structure/folder-structure.md](../structure/folder-structure.md)). Nenhum Use Case importa Prisma diretamente (DIP).

### Regra de isolamento multi-tenant nos repositories

Todo método de repository cujo aggregate tem `tenantId` (diretamente ou via `channelId`) **exige** `tenantId` como parâmetro explícito (não opcional) e o aplica como filtro obrigatório na implementação Prisma — nunca delegado ao chamador para lembrar de filtrar (ver [ADR-0005](../adr/0005-multi-tenant-strategy.md)). `SocialAccountRepository`/`GeneratedVideoRepository` fazem isso via `JOIN` implícito com `Channel.tenantId` na query, nunca confiando em `tenantId` vindo do cliente.

## Factories

| Factory | Responsabilidade |
|---|---|
| `TenantFactory` | Cria `Tenant` + `Membership(OWNER)` + `Subscription(TRIAL)` atomicamente a partir do cadastro de um `User` (RF-01) |
| `ChannelFactory` | Valida `PlanLimitsPolicy` (limite de canais do tenant) e cria `Channel` em estado `DRAFT`, com `publishTimes` derivados automaticamente se não informados (RF-04/RF-06) |
| `GeneratedVideoFactory` | Cria `GeneratedVideo` em estado inicial `SOURCING` a partir de `(tenantId, channelId, batchRunId, sourceVideoId, scheduledPublishAt)`, garantindo par `(batchRunId, scheduledPublishAt)` único |
| `SocialAccountFactory` | Cria `SocialAccount` a partir do callback OAuth, criptografando tokens antes de persistir; pode transicionar `Channel.status` para `ACTIVE` se completar os requisitos de `platforms` |

Factories existem sempre que a criação de um Aggregate envolve mais de uma invariante cruzada (ex.: validar limite de plano + criar entidade) — criação trivial de aggregate simples (ex.: `Notification`) não precisa de factory dedicada, apenas construtor/método estático da própria entidade.
