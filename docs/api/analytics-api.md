# API — Analytics

## `GET /v1/analytics/summary`
**Objetivo**: métricas agregadas do tenant (ou de um canal específico) para o dashboard (RF-13).
**Entrada**: query `?from=&to=&channelId=`
**Saída (200)**:
```json
{ "totalVideos": 42, "totalViews": 128000, "totalLikes": 5400, "totalComments": 312, "totalShares": 210, "subscribersGrowth": 340,
  "byPlatform": { "YOUTUBE": { "videos": 30, "views": 100000 }, "TIKTOK": { "videos": 12, "views": 28000 } },
  "topVideos": [{ "generatedVideoId": "uuid", "views": 42000 }] }
```
**Autorização**: `role ∈ {OWNER, ADMIN, MEMBER}` (leitura liberada a todos os papéis do tenant).
**Erros**: `UNAUTHORIZED` (401).

> Insights de aprendizado (`ChannelInsights` — RF-17) são expostos em `GET /v1/channels/:channelId/insights`, ver [channels-api.md](channels-api.md).

---

## `GET /v1/analytics/videos/:generatedVideoId/timeseries`
**Objetivo**: série temporal de `AnalyticsSnapshot` de um vídeo específico (evolução de views/likes/comments).
**Saída (200)**: lista de `{ collectedAt, views, likes, comments }` ordenada por `collectedAt`.
**Autorização**: JWT válido; vídeo pertence ao tenant.
**Erros**: `VIDEO_NOT_FOUND` (404).
