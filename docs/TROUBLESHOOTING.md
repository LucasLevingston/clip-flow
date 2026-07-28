# Troubleshooting

## Fila `video`/`ai` acumulando (`QueueThresholdExceeded`)
1. Verificar dashboard de saúde (`GET /v1/admin/health`, ver [api/admin-api.md](api/admin-api.md)).
2. Checar se é volume real (aumentar réplicas — ver [DEPLOYMENT.md](DEPLOYMENT.md#escalonamento-manual-situação-de-pico)) ou travamento (job preso — checar logs por `traceId` do job mais antigo em `waiting`).
3. Se travamento, verificar se o worker correspondente está respondendo ao `/healthz` — reiniciar réplica se necessário.

## Vídeo gerado sempre `FAILED` para um nicho específico
1. Checar se há `SourceVideo APPROVED` disponível e não usado por aquele tenant ([database/relationships-indexes.md](database/relationships-indexes.md) — índice `(niche_id, status)`).
2. Checar logs do AI Worker por `traceId` — falha de Whisper/Claude/OpenAI aparece com motivo específico (ver [workers/ai-worker.md](workers/ai-worker.md)).
3. Se `PromptTemplate` foi editado recentemente, verificar se a nova versão está bem formada (resposta fora do schema esperado gera falha após 1 retry).

## Publicação falhando com "conta precisa reautenticar"
Comportamento esperado (FA2 — ver [architecture/upload-flow.md](architecture/upload-flow.md)). Usuário deve reconectar via `POST /v1/social-accounts/:id/reauth`. Se acontece para múltiplos tenants ao mesmo tempo na mesma plataforma, suspeitar de mudança de política/token da plataforma (ver [risks/risk-matrix.md](risks/risk-matrix.md), R-07) — verificar status da API oficial da plataforma antes de tratar como bug individual.

## Rotação de secrets críticos

### `APP_ENCRYPTION_KEY`
1. Gerar nova chave, versionar como `keyVersion + 1`.
2. Deploy com ambas as chaves disponíveis (`APP_ENCRYPTION_KEY_V1`, `APP_ENCRYPTION_KEY_V2`) — leitura tenta a versão registrada no `EncryptedToken.keyVersion`, escrita sempre usa a mais nova.
3. Rodar job de re-encriptação em lote de todos os `SocialAccount.encryptedTokens` para a versão nova.
4. Após confirmação de 100% migrado, remover a chave antiga do ambiente.

### `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY`
1. Gerar novo par, publicar com novo `kid`.
2. Manter chave pública antiga disponível para validar tokens já emitidos até expirarem (15 min de access token — janela curta, rotação é rápida).

## Custo de IA acima do esperado
1. Consultar métrica de custo médio/vídeo no dashboard operacional (ver [observability/observability.md](observability/observability.md)).
2. Verificar se cache de `Transcript` está funcionando (custo de Whisper deveria cair para ~0 em vídeos-fonte já usados por outro tenant — ver [workers/ai-worker.md](workers/ai-worker.md)).
3. Verificar taxa de fallback para OpenAI (fallback frequente pode indicar degradação persistente do Claude — abrir investigação com o provedor).

## Vídeo publicado com reenquadramento ruim
1. Checar log do Video Worker — se `FocusDetector` caiu em fallback de crop central (ausência de rosto detectado), é comportamento esperado, não bug (ver [integrations/opencv.md](integrations/opencv.md)).
2. Se rosto presente mas crop ainda ruim, é candidato a melhoria de modelo de detecção — abrir Issue de melhoria, não tratar como incidente.
