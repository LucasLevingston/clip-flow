# Integração — YouTube

## Propósito
Publicação de vídeos no formato YouTube Shorts e leitura de métricas de desempenho.

## API utilizada
YouTube Data API v3 (`videos.insert` para upload, `videos.list` para métricas).

## Autenticação
OAuth 2.0 (Authorization Code flow), conectado no contexto de um `Channel` (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)). Escopos: `youtube.upload`, `youtube.readonly`. Tokens (access + refresh) armazenados criptografados em `SocialAccount.encryptedTokens`; access token renovado automaticamente via refresh token, sem ação do usuário (ver [security/secrets-encryption.md](../security/secrets-encryption.md)).

## Especificações de vídeo exigidas
- Proporção 9:16, resolução mínima recomendada 1080x1920.
- Duração: até 3 minutos para elegibilidade como Short (produto usa 15–90s por design — ver [domain/entities-value-objects.md](../domain/entities-value-objects.md)).
- Título ≤ 100 caracteres, descrição ≤ 5000 caracteres.

## Uso no pipeline
- **Upload Worker**: publica via `videos.insert` (resumable upload), define título/descrição/tags a partir de `GeneratedVideo.copy`.
- **Analytics Worker**: consulta `videos.list?part=statistics` periodicamente (ver [workers/analytics-worker.md](../workers/analytics-worker.md)).

## Rate limit / quota
Quota diária por projeto Google Cloud (unidades, não requisições simples — upload custa ~1600 unidades). Upload Worker trata `403 quotaExceeded` como falha transitória (FA4 — reagenda para próxima janela).

## Erros tratados
| Erro | Tratamento |
|---|---|
| `401 invalid_grant` (refresh token revogado) | `SocialAccount.status = NEEDS_REAUTH` (access token expirado sozinho é renovado automaticamente, não gera este erro) |
| `403 quotaExceeded` | Reagenda (FA4) |
| `400 invalidVideoMetadata` | Falha definitiva, `PublishRecord.status = FAILED` (não é transitório) |

## Segredos necessários
`YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI` (ver [security/secrets-encryption.md](../security/secrets-encryption.md) e [ENVIRONMENT.md](../ENVIRONMENT.md)).
