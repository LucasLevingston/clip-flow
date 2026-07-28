# API — Canais

> Substitui a antiga assinatura de nicho no nível do tenant e a agenda de publicação separada — ver [ADR-0011](../adr/0011-channel-as-aggregate.md). Configuração de contas sociais do canal está em [social-accounts-api.md](social-accounts-api.md); catálogo de nichos em [niches-api.md](niches-api.md).

## `GET /v1/channels`
**Objetivo**: lista canais do tenant (RF-13).
**Entrada**: query `?page=&pageSize=&status=`
**Saída (200)**: lista paginada de `{ id, name, nicheId, nicheName, status, platforms, videosPerDay, createdAt }`
**Autorização**: JWT válido (qualquer papel do tenant).
**Erros**: `UNAUTHORIZED` (401).

---

## `POST /v1/channels`
**Objetivo**: cria um canal (RF-04).
**Entrada**:
```json
{ "nicheId": "uuid", "name": "string", "language": "string",
  "videosPerDay": 4, "publishTimes": ["09:00","12:00","16:00","20:00"],
  "generationTime": "06:00", "platforms": "SHORTS_ONLY|TIKTOK_ONLY|BOTH",
  "thumbnailEnabled": true, "promptOverride": "string?" }
```
Se `publishTimes` for omitido, o sistema distribui automaticamente `videosPerDay` horários dentro da janela padrão (RF-06).
**Saída (201)**: `Channel` criado com `status: "DRAFT"`.
**Validações**: `PlanLimitsPolicy` — bloqueia acima de `maxChannels`; `videosPerDay` ≤ `maxVideosPerDayPerChannel`; `publishTimes.length == videosPerDay` quando informado; nicho `ACTIVE`.
**Autorização**: `role ∈ {OWNER, ADMIN}`.
**Erros**: `PLAN_LIMIT_EXCEEDED` (422), `NICHE_INACTIVE` (422), `PUBLISH_TIMES_COUNT_MISMATCH` (422).

---

## `GET /v1/channels/:channelId`
**Objetivo**: detalhe de um canal, incluindo status de contas sociais.
**Saída (200)**: `Channel` completo + `SocialAccount[]` resumidos + `ChannelInsights` mais recente (se existir).
**Autorização**: JWT válido; canal pertence ao tenant.
**Erros**: `CHANNEL_NOT_FOUND` (404).

---

## `PATCH /v1/channels/:channelId`
**Objetivo**: edita configuração do canal (nome, idioma, `videosPerDay`, `publishTimes`, `generationTime`, `platforms`, `thumbnailEnabled`, `promptOverride`) — RF-06.
**Saída (200)**: `Channel` atualizado. Alterações valem a partir do próximo lote (não interrompe geração/publicação em andamento).
**Validações**: mesmas de criação; `nicheId` não pode ser alterado (imutável — criar novo canal).
**Autorização**: `role ∈ {OWNER, ADMIN}`.
**Erros**: `CHANNEL_NOT_FOUND` (404), `PLAN_LIMIT_EXCEEDED` (422), `NICHE_IMMUTABLE` (422).

---

## `PATCH /v1/channels/:channelId/status`
**Objetivo**: pausa/retoma o canal (RF-14).
**Entrada**: `{ "status": "ACTIVE" | "PAUSED" }`
**Saída (200)**: `Channel` atualizado.
**Validações**: transição para `ACTIVE` exige `IsChannelReadyToPublishSpecification` satisfeita (contas sociais necessárias conectadas).
**Autorização**: `role ∈ {OWNER, ADMIN}`.
**Erros**: `CHANNEL_NOT_READY` (422 — contas sociais pendentes), `CHANNEL_NOT_FOUND` (404).

---

## `DELETE /v1/channels/:channelId`
**Objetivo**: remove o canal definitivamente (mantém histórico de `GeneratedVideo`, que passa a referenciar um canal excluído apenas para fins de auditoria — consulta de detalhe do vídeo continua funcionando).
**Saída (204)**: vazio.
**Autorização**: `role = OWNER`.
**Erros**: `CHANNEL_NOT_FOUND` (404).

---

## `GET /v1/channels/:channelId/insights`
**Objetivo**: retorna o `ChannelInsights` mais recente do canal (RF-17).
**Saída (200)**: `{ channelId, bestPublishHours, topTitlePatterns, topHashtags, avgOptimalDurationMs, computedAt }` ou `204` se ainda não houver histórico suficiente.
**Autorização**: JWT válido; canal pertence ao tenant.
**Erros**: `CHANNEL_NOT_FOUND` (404).
