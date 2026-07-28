# Relacionamentos e Índices

> Revisado após [ADR-0011](../adr/0011-channel-as-aggregate.md).

## Relacionamentos (cardinalidade e regra de exclusão)

| Relação | Cardinalidade | `ON DELETE` | Nota |
|---|---|---|---|
| `Tenant` → `Membership` | 1:N | `CASCADE` | Membership não existe sem tenant |
| `User` → `Membership` | 1:N | `CASCADE` | — |
| `Tenant` → `Subscription` | 1:1 | `RESTRICT` | Tenant não pode ser removido com assinatura ativa; cancelar antes |
| `Plan` → `Subscription` | 1:N | `RESTRICT` | Plano em uso não pode ser excluído |
| `Tenant` → `Channel` | 1:N | `CASCADE` | Canal não existe sem tenant |
| `Niche` → `Channel` | 1:N | `RESTRICT` | Nicho referenciado por canal ativo não pode ser desativado por exclusão física (usar `status = INACTIVE`) |
| `Niche` → `SourceVideo` | 1:N | `RESTRICT` | Vídeo-fonte referenciado por `GeneratedVideo` não pode sumir |
| `Niche` → `PromptTemplate` | 1:N | `RESTRICT` | — |
| `Channel` → `SocialAccount` | 1:N (máx. 2: 1 YouTube + 1 TikTok) | `CASCADE` | Remover canal remove suas contas conectadas |
| `Channel` → `ChannelInsights` | 1:1 | `CASCADE` | Projeção derivada, some com o canal |
| `Channel`/`SourceVideo` → `GeneratedVideo` | 1:N | `RESTRICT` | Histórico de geração nunca é apagado em cascata |
| `SourceVideo` → `Transcript` | 1:1 | `RESTRICT` | Cache compartilhado entre canais — não pode ser removido enquanto houver `SourceVideo` ativo |
| `GeneratedVideo` → `PublishRecord` | 1:N (até 2 — 1 por plataforma) | `RESTRICT` | Registro de publicação é histórico imutável |
| `SocialAccount` → `PublishRecord` | 1:N | `RESTRICT` | — |
| `PublishRecord` → `AnalyticsSnapshot` | 1:N | `CASCADE` | Métricas são derivadas, podem ser recalculadas |
| `Tenant`/`User` → `Notification` | 1:N | `CASCADE` | — |

## Índices

| Tabela | Índice | Motivo |
|---|---|---|
| `membership` | `UNIQUE (tenant_id, user_id)` | Um usuário tem no máximo um papel por tenant |
| `subscription` | `UNIQUE (tenant_id)` | Uma assinatura ativa por tenant |
| `channel` | `INDEX (tenant_id, status)` | Dashboard: canais ativos do tenant (RF-13) |
| `channel` | `INDEX (niche_id, status)` | Query do Scheduler/curadoria: canais ativos por nicho |
| `source_video` | `INDEX (niche_id, status)` | Seleção de fonte disponível por nicho (RF-09) |
| `social_account` | `UNIQUE (channel_id, platform)` | No máximo 1 conta por plataforma por canal |
| `social_account` | `INDEX (channel_id, status)` | Verificação rápida de contas prontas para publicar (`IsChannelReadyToPublishSpecification`) |
| `generated_video` | `UNIQUE (channel_id, batch_run_id, scheduled_publish_at)` | Idempotência de geração em lote (RNF-34 — ver [ADR-0012](../adr/0012-batch-generation-delayed-publish.md)) |
| `generated_video` | `INDEX (tenant_id, created_at DESC)` | Dashboard/histórico paginado do tenant (RF-13) |
| `generated_video` | `INDEX (channel_id, created_at DESC)` | Painel do canal específico |
| `generated_video` | `INDEX (channel_id, source_video_id)` | Verificação "fonte já usada por este canal" (RF-09) |
| `transcript` | `UNIQUE (source_video_id)` | Um transcript por vídeo-fonte |
| `publish_record` | `UNIQUE (generated_video_id, social_account_id)` | Idempotência de publicação (RNF-34) |
| `analytics_snapshot` | `INDEX (publish_record_id, collected_at DESC)` | Série temporal de métricas por publicação |
| `notification` | `INDEX (tenant_id, user_id, read_at)` | Contagem de não lidas |
| `user` | `UNIQUE (email)` | Login único |
| `niche` | `UNIQUE (slug)` | URL amigável e referência estável |

## Regra geral

Toda tabela com `tenant_id` (direto ou via `channel_id`) tem índice composto começando por `tenant_id`/`channel_id` nas consultas de maior volume (padrão de acesso multi-tenant — ver [ADR-0005](../adr/0005-multi-tenant-strategy.md)), evitando table scan cross-tenant. `generated_video.tenant_id` é denormalizado a partir de `channel.tenant_id` exatamente para permitir esse índice direto sem `JOIN` em toda leitura do dashboard.
