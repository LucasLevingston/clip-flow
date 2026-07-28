# Integração — TikTok

## Propósito
Publicação de vídeos e leitura de métricas de desempenho no TikTok.

## API utilizada
TikTok Content Posting API (publicação direta) + TikTok Display API (métricas).

## Autenticação
OAuth 2.0, conectado no contexto de um `Channel` (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)). Escopos: `video.publish`, `video.list`. Tokens armazenados criptografados em `SocialAccount.encryptedTokens`; access token renovado automaticamente via refresh token, sem ação do usuário (ver [security/secrets-encryption.md](../security/secrets-encryption.md)).

## Especificações de vídeo exigidas
- Proporção 9:16.
- Duração: 15s–10min (produto usa 15–90s por design).
- Caption ≤ 2200 caracteres, incluindo hashtags e CTA.

## Uso no pipeline
- **Upload Worker**: publica via endpoint de "direct post" da Content Posting API, define caption a partir de `GeneratedVideo.copy` (título + hashtags + CTA combinados, já que TikTok não separa título/descrição). Quando `Channel.platforms = BOTH`, usa o mesmo `finalAssetUrl` publicado no YouTube (espelhamento — ver [architecture/upload-flow.md](../architecture/upload-flow.md)).
- **Analytics Worker**: consulta métricas via Display API.

## Rate limit / quota
Limite por aplicativo e por usuário conectado (requests/min); TikTok também aplica revisão de app para produção (sandbox vs. produção — considerar prazo de aprovação no roadmap, ver [risks/risk-matrix.md](../risks/risk-matrix.md)).

## Erros tratados
| Erro | Tratamento |
|---|---|
| `401` refresh token inválido/revogado | `SocialAccount.status = NEEDS_REAUTH` (access token expirado sozinho é renovado automaticamente, não gera este erro) |
| `429` rate limit | Reagenda (FA4) |
| Vídeo rejeitado por política de conteúdo da plataforma | Falha definitiva, `PublishRecord.status = FAILED` |

## Segredos necessários
`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`.

## Observação de risco
Aprovação do app TikTok para produção (fora de sandbox) tem prazo e critérios definidos pela própria plataforma — tratado como risco de cronograma em [risks/risk-matrix.md](../risks/risk-matrix.md).
