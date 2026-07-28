# API — Console Administrativo

Todas as rotas abaixo exigem `user.isPlatformAdmin = true`, independente de papel de tenant (RF-15).

## `POST /v1/admin/niches`
**Objetivo**: cria novo nicho no catálogo (RF-15, Objetivo O5).
**Entrada**: `{ "name": "string", "slug": "string", "description": "string", "category": "string" }`
**Saída (201)**: `Niche` criado com `status: "INACTIVE"` (ativado manualmente após ter ao menos 1 `SourceVideo` aprovado).
**Validações**: `slug` único.
**Autorização**: `PLATFORM_ADMIN`.
**Erros**: `SLUG_ALREADY_EXISTS` (409).

---

## `PATCH /v1/admin/niches/:id`
**Objetivo**: edita nicho (nome, descrição, status).
**Saída (200)**: `Niche` atualizado.
**Autorização**: `PLATFORM_ADMIN`.
**Erros**: `NICHE_NOT_FOUND` (404).

---

## `POST /v1/admin/niches/:id/prompt-templates`
**Objetivo**: cria nova versão de `PromptTemplate` para o nicho (seleção de highlight ou geração de copy).
**Entrada**: `{ "type": "HIGHLIGHT_SELECTION" | "COPY_GENERATION", "content": "string" }`
**Saída (201)**: `PromptTemplate` criado com `version` incrementado; torna-se o ativo do nicho.
**Autorização**: `PLATFORM_ADMIN`.
**Erros**: `NICHE_NOT_FOUND` (404).

---

## `POST /v1/admin/source-videos`
**Objetivo**: ingere novo vídeo-fonte para um nicho (RF-07).
**Entrada**: `{ "nicheId": "uuid", "storageUrl": "string", "durationSeconds": number, "licenseType": "PUBLIC_DOMAIN|CREATIVE_COMMONS|PARTNER_AGREEMENT", "licenseReference": "string" }`
**Saída (201)**: `SourceVideo` com `status: "PENDING_REVIEW"`.
**Validações**: `licenseType`/`licenseReference` obrigatórios (ver [ADR-0006](../adr/0006-content-source-strategy.md)).
**Autorização**: `PLATFORM_ADMIN`.
**Erros**: `NICHE_NOT_FOUND` (404), `VALIDATION_ERROR` (422).

---

## `PATCH /v1/admin/source-videos/:id/review`
**Objetivo**: aprova ou rejeita vídeo-fonte em revisão.
**Entrada**: `{ "decision": "APPROVED" | "REJECTED", "reason": "string?" }`
**Saída (200)**: `SourceVideo` atualizado.
**Autorização**: `PLATFORM_ADMIN`.
**Erros**: `SOURCE_VIDEO_NOT_FOUND` (404), `SOURCE_VIDEO_NOT_PENDING` (409).

---

## `GET /v1/admin/moderation-queue`
**Objetivo**: lista `GeneratedVideo` em `PENDING_MODERATION` (FA3).
**Saída (200)**: lista paginada com `flagReason`.
**Autorização**: `PLATFORM_ADMIN`.
**Erros**: nenhum específico.

---

## `PATCH /v1/admin/moderation-queue/:generatedVideoId`
**Objetivo**: aprova/rejeita vídeo sinalizado.
**Entrada**: `{ "decision": "APPROVED" | "REJECTED", "reason": "string?" }`
**Saída (200)**: `GeneratedVideo` atualizado (segue para corte se aprovado).
**Autorização**: `PLATFORM_ADMIN`.
**Erros**: `VIDEO_NOT_FOUND` (404), `VIDEO_NOT_PENDING_MODERATION` (409).

---

## `GET /v1/admin/health`
**Objetivo**: status agregado de filas, workers e integrações externas (RF-16).
**Saída (200)**:
```json
{ "queues": [{ "name": "video", "waiting": 3, "active": 1, "failed": 0 }],
  "integrations": [{ "name": "youtube", "status": "UP" }, { "name": "tiktok", "status": "DEGRADED" }] }
```
**Autorização**: `PLATFORM_ADMIN`.
**Erros**: nenhum específico.
