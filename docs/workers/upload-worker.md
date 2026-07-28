# Upload Worker

## Responsabilidade
Publicar `GeneratedVideo` prontos nas `SocialAccount`s do canal, no horário-alvo (`scheduledPublishAt`), de forma idempotente e resiliente a falhas de plataforma — espelhando em ambas as plataformas quando `Channel.platforms = BOTH` (ver [architecture/upload-flow.md](../architecture/upload-flow.md), [ADR-0011](../adr/0011-channel-as-aggregate.md), [ADR-0012](../adr/0012-batch-generation-delayed-publish.md)).

## Entradas
- Job **delayed** da fila `upload` (delay definido pelo Video Worker até `scheduledPublishAt`), payload: `{ generatedVideoId, channelId, traceId }` — um job por plataforma-alvo do canal.
- Lê de banco: `GeneratedVideo.finalAssetUrl`, `GeneratedVideo.copy`, `Channel.platforms`, `SocialAccount` (tokens descriptografados sob demanda, renovados automaticamente se necessário — ver [security/secrets-encryption.md](../security/secrets-encryption.md)).

## Saídas
- Cria `PublishRecord` (`PUBLISHED` ou `FAILED`).
- Evento `VideoPublished` (fila `notification` + `analytics`) ou `VideoPublishFailed` (fila `notification`).
- Em falha de autenticação: `SocialAccount.status = NEEDS_REAUTH`, evento `SocialAccountNeedsReauth`.

## Fila
- Consome: `upload`
- Produz: `notification`, `analytics`

## Eventos
- Consumido: `VideoReadyToPublish`
- Publicado: `VideoPublished`, `VideoPublishFailed`, `SocialAccountNeedsReauth`

## Tratamento de erros
| Erro | Ação |
|---|---|
| Token expirado (access token) | Renovado automaticamente via refresh token antes da tentativa (não chega a ser erro na maioria dos casos — ver `TokenRefreshPolicy`) |
| Refresh token inválido/revogado (401/403 de auth) | `SocialAccount.status = NEEDS_REAUTH`; `SocialAccountNeedsReauth`; job não é reagendado automaticamente (depende de ação do usuário) |
| Rate limit/quota da plataforma (429/403-quota, FA4) | Reagenda job com delay calculado a partir do header de retry da API, sem contar como tentativa de retry padrão |
| Falha de rede/5xx transitório | Retry padrão |
| Falha definitiva após retries | `PublishRecord.status = FAILED`; `VideoPublishFailed` |

## Retries
Máximo **3 tentativas** (mais conservador que os demais workers), backoff exponencial base 10s — republicar duplicado é mais custoso que atrasar.

## Timeout
3 minutos por job (upload de vídeo curto — arquivo já está otimizado pelo Video Worker).

## Idempotência
`UNIQUE (generated_video_id, social_account_id)` em `PublishRecord` — reprocessamento do mesmo job nunca resulta em segunda publicação (RNF-34). Ver detalhamento em [architecture/upload-flow.md](../architecture/upload-flow.md).
