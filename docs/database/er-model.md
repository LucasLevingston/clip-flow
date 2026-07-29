# Modelo ER

> Revisado após [ADR-0011](../adr/0011-channel-as-aggregate.md) — `channel` substitui `niche_subscription` + `publish_schedule`; `social_account` migrou de `tenant_id` para `channel_id`; `generated_video` referencia `channel_id`; nova tabela `channel_insights`.
>
> Revisado na Sprint 2 (EPIC-02/EPIC-03) para fechar o contrato já documentado em [api/niches-api.md](../api/niches-api.md) e [api/billing-api.md](../api/billing-api.md): `niche` ganha `description`/`category`/`preview_thumbnail_url` (necessários para navegação do catálogo, RF-03); `plan` ganha `stripe_price_id` e `subscription` ganha `stripe_customer_id`/`stripe_subscription_id` (necessários para checkout e sincronização de webhook, RF-08).
>
> Revisado na Sprint 3 (EPIC-02.F2/EPIC-04.F1): `channel` ganha `deleted_at` — `DELETE /v1/channels/:channelId` ([api/channels-api.md](../api/channels-api.md)) precisa remover o canal da visão do tenant mantendo `generated_video` referenciável para auditoria, o que a FK `Restrict` de `generated_video.channel_id` não permitiria com um DELETE físico.

```mermaid
erDiagram
  TENANT ||--o{ MEMBERSHIP : has
  USER ||--o{ MEMBERSHIP : has
  TENANT ||--|| SUBSCRIPTION : has
  PLAN ||--o{ SUBSCRIPTION : defines
  TENANT ||--o{ CHANNEL : owns
  NICHE ||--o{ CHANNEL : "targeted by"
  NICHE ||--o{ SOURCE_VIDEO : has
  NICHE ||--o{ PROMPT_TEMPLATE : has
  CHANNEL ||--o{ SOCIAL_ACCOUNT : connects
  CHANNEL ||--|| CHANNEL_INSIGHTS : has
  CHANNEL ||--o{ GENERATED_VIDEO : owns
  SOURCE_VIDEO ||--o{ GENERATED_VIDEO : "sourced from"
  SOURCE_VIDEO ||--|| TRANSCRIPT : has
  GENERATED_VIDEO ||--o{ PUBLISH_RECORD : "published as"
  SOCIAL_ACCOUNT ||--o{ PUBLISH_RECORD : "published to"
  PUBLISH_RECORD ||--o{ ANALYTICS_SNAPSHOT : "measured by"
  TENANT ||--o{ NOTIFICATION : receives
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ NOTIFICATION_PREFERENCE : configures

  TENANT {
    uuid id PK
    string name
    string timezone
    timestamp created_at
    timestamp deleted_at
  }
  USER {
    uuid id PK
    string email UK
    string password_hash
    boolean is_platform_admin
    timestamp created_at
    timestamp deleted_at
  }
  MEMBERSHIP {
    uuid id PK
    uuid tenant_id FK
    uuid user_id FK
    string role
    timestamp created_at
  }
  PLAN {
    uuid id PK
    string name
    int max_channels
    int max_videos_per_day_per_channel
    int price_cents
    string stripe_price_id UK "nullable — TRIAL não tem"
  }
  SUBSCRIPTION {
    uuid id PK
    uuid tenant_id FK
    uuid plan_id FK
    string status
    timestamp current_period_end
    string stripe_customer_id UK "nullable até 1º checkout"
    string stripe_subscription_id UK "nullable até 1º checkout"
    timestamp created_at
  }
  NICHE {
    uuid id PK
    string name
    string slug UK
    string description
    string category
    string preview_thumbnail_url "nullable"
    string status
    uuid active_prompt_template_id FK
    timestamp created_at
  }
  SOURCE_VIDEO {
    uuid id PK
    uuid niche_id FK
    int duration_seconds
    string license_type
    string license_reference
    string status
    string storage_url
    timestamp created_at
  }
  PROMPT_TEMPLATE {
    uuid id PK
    uuid niche_id FK
    string type
    text content
    int version
    timestamp created_at
  }
  CHANNEL {
    uuid id PK
    uuid tenant_id FK
    uuid niche_id FK
    string name
    string language
    text prompt_override
    int videos_per_day
    jsonb publish_times
    string generation_time
    string platforms
    boolean thumbnail_enabled
    string status
    timestamp created_at
    timestamp deleted_at "nullable — remoção é soft delete, preserva histórico de GENERATED_VIDEO"
  }
  SOCIAL_ACCOUNT {
    uuid id PK
    uuid channel_id FK
    string platform
    string external_account_id
    string status
    bytea encrypted_tokens
    int token_key_version
    timestamp refresh_expires_at
    timestamp created_at
    timestamp deleted_at
  }
  CHANNEL_INSIGHTS {
    uuid channel_id PK, FK
    jsonb best_publish_hours
    jsonb top_title_patterns
    jsonb top_hashtags
    int avg_optimal_duration_ms
    timestamp computed_at
  }
  GENERATED_VIDEO {
    uuid id PK
    uuid tenant_id FK
    uuid channel_id FK
    uuid source_video_id FK
    string batch_run_id
    timestamp scheduled_publish_at
    string status
    jsonb highlight
    jsonb copy
    string thumbnail_url
    string final_asset_url
    string failure_reason
    timestamp created_at
    timestamp updated_at
  }
  TRANSCRIPT {
    uuid id PK
    uuid source_video_id FK UK
    jsonb segments
    string language
    timestamp created_at
  }
  PUBLISH_RECORD {
    uuid id PK
    uuid generated_video_id FK
    uuid social_account_id FK
    string platform
    string external_post_id
    string status
    string failure_reason
    timestamp published_at
  }
  ANALYTICS_SNAPSHOT {
    uuid id PK
    uuid publish_record_id FK
    int views
    int likes
    int comments
    int shares
    float retention_rate
    float ctr
    timestamp collected_at
  }
  NOTIFICATION {
    uuid id PK
    uuid tenant_id FK
    uuid user_id FK
    string category
    jsonb payload
    timestamp read_at
    timestamp created_at
  }
  NOTIFICATION_PREFERENCE {
    uuid user_id FK
    string category
    boolean email_enabled
  }
```

Este diagrama é a projeção relacional do modelo de domínio descrito em [domain/entities-value-objects.md](../domain/entities-value-objects.md). `NICHE`, `SOURCE_VIDEO` e `PROMPT_TEMPLATE` não têm `tenant_id` — são catálogo compartilhado (ver [ADR-0006](../adr/0006-content-source-strategy.md)). `CHANNEL` é a unidade central de configuração (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)) — `SOCIAL_ACCOUNT` e `GENERATED_VIDEO` a referenciam diretamente; `tenant_id` em `GENERATED_VIDEO` é denormalizado a partir de `CHANNEL.tenant_id` para performance de filtro multi-tenant (ver [database/relationships-indexes.md](relationships-indexes.md)).
