# API — Vídeos Gerados

## `GET /v1/videos`
**Objetivo**: histórico paginado de `GeneratedVideo` do tenant (RF-13).
**Entrada**: query `?page=&pageSize=&channelId=&platform=&status=&from=&to=`
**Saída (200)**: lista paginada de `{ id, channelId, status, sourceVideoId, thumbnailUrl, finalAssetUrl, scheduledPublishAt, createdAt, publishRecords: [{platform, status, externalPostId, publishedAt}] }`
**Autorização**: JWT válido (qualquer papel do tenant, escopo automático por `tenant_id`).
**Erros**: `UNAUTHORIZED` (401).

---

## `GET /v1/videos/:id`
**Objetivo**: detalhe de um vídeo gerado, incluindo highlight, copy (título/descrição/hashtags/CTA), thumbnail e métricas mais recentes.
**Saída (200)**: `GeneratedVideo` completo (`highlight`, `copy: {title, description, hashtags, cta}`, `thumbnailUrl`) + `PublishRecord[]` + `AnalyticsSnapshot` mais recente por record.
**Autorização**: JWT válido; vídeo deve pertencer ao `tenant_id` do usuário (via `channelId`).
**Erros**: `VIDEO_NOT_FOUND` (404 — inclusive se pertence a outro tenant, para não vazar existência).

---

## `GET /v1/videos/export`
**Objetivo**: exporta histórico filtrado em CSV (RF-13).
**Entrada**: mesmos filtros de `GET /v1/videos`.
**Saída (200)**: `text/csv` com colunas `id,channel,status,platform,publishedAt,views,likes,comments`.
**Autorização**: `role ∈ {OWNER, ADMIN}`.
**Erros**: `UNAUTHORIZED` (401).
