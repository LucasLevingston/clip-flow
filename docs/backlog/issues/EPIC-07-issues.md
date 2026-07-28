# Issues — EPIC-07 Publicação

> Revisado após [ADR-0012](../../adr/0012-batch-generation-delayed-publish.md) — job de publicação chega já atrasado (delay até `scheduledPublishAt`), com fan-out quando `Channel.platforms = BOTH`.

---

### ISSUE-07.F1.S1.T1 — YoutubePublisherAdapter
**Descrição**: publicar vídeo no YouTube via API oficial.
**Objetivo**: implementar a primeira via de publicação do RF-10.
**Motivação**: sem publicação, o produto nunca entrega o valor prometido ao usuário — é o passo que fecha o ciclo de valor.
**Arquivos envolvidos**: `apps/workers/src/upload/infrastructure/adapters/YoutubePublisherAdapter.ts`.
**Critérios de aceite**: retorna `externalPostId`; trata `401`/`403 quota`/`400` conforme documentado.
**Critérios de teste**: unitário (mapeamento de erros); integração em modo sandbox.
**Checklist**: [ ] token descriptografado apenas em memória.
**Dependências**: EPIC-06, EPIC-04.
**Labels**: `epic:EPIC-07`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-07.F1.S1.T2 — TiktokPublisherAdapter
**Descrição**: publicar vídeo no TikTok via Content Posting API.
**Objetivo**: implementar a segunda via de publicação do RF-10.
**Motivação**: TikTok é plataforma-alvo desde o MVP; sem ela o produto entrega só metade da proposta.
**Arquivos envolvidos**: `apps/workers/src/upload/infrastructure/adapters/TiktokPublisherAdapter.ts`.
**Critérios de aceite**: mesmo contrato de saída do adapter YouTube.
**Critérios de teste**: mesmos casos do YouTube, adaptados.
**Checklist**: [ ] validado contra app TikTok em sandbox antes de produção.
**Dependências**: ISSUE-07.F1.S1.T1.
**Labels**: `epic:EPIC-07`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-07.F1.S1.T3 — PublishVideoUseCase com fan-out, idempotência e retry
**Descrição**: orquestração da publicação, garantindo nunca publicar duplicado e espelhando quando `Channel.platforms = BOTH`.
**Objetivo**: implementar RNF-34 na prática, com suporte a espelhamento em duas plataformas.
**Motivação**: publicação duplicada é o pior tipo de bug deste produto — visível publicamente na conta do cliente; espelhamento incompleto (só 1 de 2 plataformas) quebraria a promessa de "Ambos".
**Arquivos envolvidos**: `apps/workers/src/upload/application/use-cases/PublishVideoUseCase.ts`.
**Critérios de aceite**: reprocessar o mesmo job nunca gera segunda publicação; `BOTH` gera 2 `PublishRecord` independentes a partir do mesmo `finalAssetUrl`.
**Critérios de teste**: unitário (idempotência, fan-out, todos os ramos de erro); integração (constraint `UNIQUE` real; delay do job respeitado).
**Checklist**: [ ] `SocialAccountNeedsReauth` emitido corretamente em FA2; falha em uma plataforma não impede a outra.
**Dependências**: ISSUE-07.F1.S1.T1, ISSUE-07.F1.S1.T2, ISSUE-04.F3.S1.T1.
**Labels**: `epic:EPIC-07`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).
