# API — Contas Sociais do Canal

> Contas sociais são conectadas no contexto de um canal específico, não do tenant diretamente — ver [ADR-0011](../adr/0011-channel-as-aggregate.md). No máximo 1 conta por plataforma por canal.

## `GET /v1/channels/:channelId/social-accounts`
**Objetivo**: lista contas conectadas do canal (RF-05).
**Saída (200)**: lista de `{ id, platform, externalAccountId, status, connectedAt }`
**Autorização**: `role ∈ {OWNER, ADMIN}`; canal pertence ao tenant.
**Erros**: `CHANNEL_NOT_FOUND` (404).

---

## `GET /v1/channels/:channelId/social-accounts/:platform/oauth-url`
**Objetivo**: retorna URL de autorização OAuth para conectar a conta ao canal (`platform ∈ {youtube, tiktok}`).
**Saída (200)**: `{ "url": "https://accounts.google.com/o/oauth2/..." }`
**Validações**: canal ainda não tem conta conectada para essa plataforma.
**Autorização**: `role ∈ {OWNER, ADMIN}`.
**Erros**: `SOCIAL_ACCOUNT_ALREADY_CONNECTED` (409), `CHANNEL_NOT_FOUND` (404).

---

## `POST /v1/channels/:channelId/social-accounts/:platform/oauth-callback`
**Objetivo**: troca `code` OAuth por tokens e cria `SocialAccount` vinculada ao canal (RF-05).
**Entrada**: `{ "code": "string", "state": "string" }`
**Saída (201)**: `{ id, platform, externalAccountId, status: "CONNECTED" }`. Se essa era a última plataforma exigida por `Channel.platforms`, o canal transiciona automaticamente para `ACTIVE`.
**Validações**: `state` corresponde ao emitido na etapa anterior (anti-CSRF); par `(channelId, platform)` único.
**Autorização**: `role ∈ {OWNER, ADMIN}`.
**Erros**: `INVALID_OAUTH_STATE` (400), `SOCIAL_ACCOUNT_ALREADY_CONNECTED` (409), `OAUTH_EXCHANGE_FAILED` (502).

---

## `POST /v1/channels/:channelId/social-accounts/:id/reauth`
**Objetivo**: reautentica conta em `NEEDS_REAUTH` (FA2 — disparado apenas quando a renovação automática do refresh token falha), mesmo fluxo OAuth reaplicado à conta existente.
**Saída (200)**: `SocialAccount` com `status: "CONNECTED"`.
**Autorização**: `role ∈ {OWNER, ADMIN}`.
**Erros**: `SOCIAL_ACCOUNT_NOT_FOUND` (404).

---

## `DELETE /v1/channels/:channelId/social-accounts/:id`
**Objetivo**: desconecta conta (soft delete); canal volta para `DRAFT` se essa conta era exigida por `Channel.platforms` (FA7).
**Saída (204)**: vazio.
**Autorização**: `role ∈ {OWNER, ADMIN}`.
**Erros**: `SOCIAL_ACCOUNT_NOT_FOUND` (404).
