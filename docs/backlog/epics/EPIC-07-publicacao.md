# EPIC-07 — Publicação

Cobre RF-10. Revisado após [ADR-0012](../../adr/0012-batch-generation-delayed-publish.md) — publicação é um job atrasado (delay até `scheduledPublishAt`), com fan-out para as duas plataformas quando `Channel.platforms = BOTH` (espelhamento).

## Feature EPIC-07.F1 — Upload Worker

### História EPIC-07.F1.S1 — Publicação por plataforma

**EPIC-07.F1.S1.T1 — `YoutubePublisherAdapter`**
- Objetivo: publicar vídeo no YouTube (ver [integrations/youtube.md](../../integrations/youtube.md)).
- Descrição: implementa `SocialPlatformPublisher` para YouTube via `videos.insert` (resumable upload).
- Arquivos: `apps/workers/src/upload/infrastructure/adapters/YoutubePublisherAdapter.ts`.
- Dependências: EPIC-06.F4, EPIC-04.F1.
- Critérios de aceite: retorna `externalPostId`; trata `401`/`403 quota`/`400` conforme documentado.
- Testes obrigatórios: unitário (mapeamento de erros); integração com API em modo teste/sandbox.
- Estimativa: 5 pontos.
- Checklist: [ ] token descriptografado apenas em memória, nunca logado.

**EPIC-07.F1.S1.T2 — `TiktokPublisherAdapter`**
- Objetivo: publicar vídeo no TikTok (ver [integrations/tiktok.md](../../integrations/tiktok.md)).
- Descrição: implementa a mesma interface `SocialPlatformPublisher` para TikTok Content Posting API.
- Arquivos: `apps/workers/src/upload/infrastructure/adapters/TiktokPublisherAdapter.ts`.
- Dependências: EPIC-07.F1.S1.T1 (reaproveita interface), EPIC-04.F2.
- Critérios de aceite: mesmo contrato de saída do adapter YouTube.
- Testes obrigatórios: mesmos casos do YouTube, adaptados a TikTok.
- Estimativa: 5 pontos.
- Checklist: [ ] validado contra app TikTok em sandbox antes de produção.

**EPIC-07.F1.S1.T3 — `PublishVideoUseCase` com fan-out, idempotência e retry**
- Objetivo: orquestrar publicação (ver [architecture/upload-flow.md](../../architecture/upload-flow.md)).
- Descrição: consome job delayed (disparado no `scheduledPublishAt`); para cada plataforma em `Channel.platforms`, verifica `PublishRecord` existente antes de publicar; aplica `RetryPolicy` específica (3 tentativas); usa `RefreshSocialAccountTokenUseCase` (EPIC-04.F3) antes de cada tentativa; trata FA2/FA4.
- Arquivos: `apps/workers/src/upload/application/use-cases/PublishVideoUseCase.ts`.
- Dependências: EPIC-07.F1.S1.T1, T2, EPIC-04.F3.S1.T1.
- Critérios de aceite: reprocessar o mesmo job nunca gera segunda publicação (RNF-34); `Channel.platforms = BOTH` gera 2 `PublishRecord` a partir do mesmo `finalAssetUrl`.
- Testes obrigatórios: unitário (idempotência, fan-out, todos os ramos de erro); integração (constraint `UNIQUE` real no banco; delay do job respeitado).
- Estimativa: 8 pontos.
- Checklist: [ ] `SocialAccountNeedsReauth` emitido corretamente em FA2; falha em uma plataforma não impede a outra.
