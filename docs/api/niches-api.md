# API — Catálogo de Nichos

> Assinatura de nicho e agenda de publicação agora são propriedades de `Channel` — ver [channels-api.md](channels-api.md) e [ADR-0011](../adr/0011-channel-as-aggregate.md). Este arquivo cobre apenas a navegação do catálogo (RF-03), somente leitura para tenants.

## `GET /v1/niches`
**Objetivo**: lista catálogo de nichos ativos, para uso na criação de canal (RF-03).
**Entrada**: query `?page=&pageSize=&category=`
**Saída (200)**: lista paginada de `{ id, name, slug, description, category, previewThumbnailUrl }`.
**Validações**: nenhuma além de paginação.
**Autorização**: JWT válido (qualquer papel).
**Erros**: `UNAUTHORIZED` (401).

---

## `GET /v1/niches/:nicheId`
**Objetivo**: detalhe de um nicho.
**Saída (200)**: `{ id, name, slug, description, category, status }`
**Autorização**: JWT válido.
**Erros**: `NICHE_NOT_FOUND` (404).
