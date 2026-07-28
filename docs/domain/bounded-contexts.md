# Modelagem de Domínio — Bounded Contexts

> Modelo revisado após [ADR-0011](../adr/0011-channel-as-aggregate.md): os contextos antes chamados "Social Integration" e "Scheduling" foram fundidos em **Channel Management**, com `Channel` como Aggregate Root central do produto.

## Mapa de contextos

```mermaid
flowchart TB
  subgraph Identity["Identity & Access"]
    Tenant
    User
    Membership
  end

  subgraph Catalog["Content Catalog (compartilhado, sem tenant_id)"]
    Niche
    SourceVideo
    PromptTemplate
  end

  subgraph Billing["Subscription & Billing"]
    Plan
    Subscription
  end

  subgraph ChannelMgmt["Channel Management"]
    Channel
    SocialAccount
    ChannelInsights
  end

  subgraph Generation["Content Generation"]
    GeneratedVideo
    Transcript
  end

  subgraph Publishing["Publishing"]
    PublishRecord
  end

  subgraph Analytics["Analytics"]
    AnalyticsSnapshot
  end

  subgraph Notification["Notification"]
    Notification
  end

  Identity -->|tenantId| Billing
  Identity -->|tenantId| ChannelMgmt
  ChannelMgmt -->|nicheId| Catalog
  ChannelMgmt -->|planId via Subscription| Billing
  Generation -->|channelId| ChannelMgmt
  Generation -->|sourceVideoId| Catalog
  Publishing -->|generatedVideoId| Generation
  Publishing -->|socialAccountId| ChannelMgmt
  Analytics -->|publishRecordId| Publishing
  Analytics -->|alimenta| ChannelMgmt
  Notification -.->|reage a eventos de todos| Identity
  Notification -.-> Generation
  Notification -.-> Publishing
```

## Contextos e suas responsabilidades

### 1. Identity & Access
Dono de `Tenant`, `User`, `Membership` (papel do usuário no tenant) e do papel de plataforma `PLATFORM_ADMIN`. Único contexto que sabe autenticar e autorizar.

### 2. Content Catalog
Dono de `Niche`, `SourceVideo` e `PromptTemplate`. **Não tem `tenant_id`** — é catálogo compartilhado, administrado pela plataforma (RF-03, RF-07, RF-15). Todo outro contexto referencia `Niche`/`SourceVideo` apenas por ID (nunca duplica dados do catálogo).

### 3. Subscription & Billing
Dono de `Plan` e `Subscription` (assinatura do tenant a um plano SaaS). Fonte de verdade de limites (RF-08 — `maxChannels`, `maxVideosPerDayPerChannel`) — todo outro contexto que precisa validar limite consulta este contexto via `PlanLimitsPolicy` (ver [policies-specifications.md](policies-specifications.md)), nunca duplica a regra.

### 4. Channel Management
Dono de `Channel` (Aggregate Root central — RF-04, RF-06), `SocialAccount` (Aggregate Root próprio, referenciando `channelId` — ver [ADR-0011](../adr/0011-channel-as-aggregate.md)) e `ChannelInsights` (projeção de aprendizado — [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)). Um canal aponta para exatamente um `Niche` (Catalog) e para uma `Subscription` (Billing) via o tenant. Substitui os antigos contextos "Social Integration" e "Scheduling" — configuração de agenda, plataformas-alvo e contas sociais são todas propriedades do mesmo `Channel`.

### 5. Content Generation
Dono de `GeneratedVideo` (Aggregate Root do pipeline) e `Transcript`. Consome `SourceVideo` do Catalog (somente leitura) e `Channel`/`ChannelInsights` do Channel Management (somente leitura, por ID) e produz o vídeo pronto para publicação.

### 6. Publishing
Dono de `PublishRecord`. Depende de Content Generation (o quê publicar) e Channel Management (onde publicar — via `SocialAccount`).

### 7. Analytics
Dono de `AnalyticsSnapshot`. Depende de `PublishRecord` (por ID). Alimenta `ChannelInsights` (Channel Management) através de um Use Case dedicado que lê `AnalyticsSnapshot` como projeção de leitura — nunca importa entidade de Analytics diretamente em Channel Management (ver regra de comunicação abaixo).

### 8. Notification
Dono de `Notification` e `NotificationPreference`. É puramente reativo — consome eventos de todos os outros contextos (ver [architecture/event-flow.md](../architecture/event-flow.md)), nunca é chamado sincronamente por eles.

## Shared Kernel

Tipos de identidade compartilhados entre contextos (Value Objects imutáveis, sem lógica de negócio própria): `TenantId`, `NicheId`, `UserId`, `SourceVideoId`, `ChannelId`, `SocialAccountId`, `GeneratedVideoId`, `PublishRecordId`. Vivem em `packages/shared-types` (ver [ADR-0001](../adr/0001-monorepo-vs-polyrepo.md)) e **não** carregam comportamento de domínio — apenas identidade tipada, para evitar contextos importando entidades uns dos outros.

## Regra de comunicação entre contextos

Contextos nunca importam entidades/repositórios uns dos outros diretamente. Comunicação é sempre por:
1. **ID + Shared Kernel** (referência fraca), ou
2. **Evento de domínio** (ver [events-commands-queries.md](events-commands-queries.md)), ou
3. **Application Service dedicado de leitura** (ex.: `PlanLimitsPolicy`, `ChannelPerformanceReader` — este último é como o Use Case de Channel Management lê dados de Analytics sem importar sua entidade diretamente).

Essa regra espelha, no domínio, o mesmo princípio de encapsulamento de `index.ts` exigido para features de frontend (contrato público por `index.ts`, sem import de sub-caminho interno — ver [structure/conventions.md](../structure/conventions.md)).
