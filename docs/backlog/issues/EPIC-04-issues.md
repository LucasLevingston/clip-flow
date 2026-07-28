# Issues — EPIC-04 Contas Sociais do Canal

> Revisado após [ADR-0011](../../adr/0011-channel-as-aggregate.md) — contas conectadas no contexto de um `Channel`.

---

### ISSUE-04.F1.S1.T1 — SocialAccountFactory + criptografia de tokens + TokenRefreshPolicy
**Descrição**: base de domínio compartilhada por YouTube e TikTok, incluindo renovação automática.
**Objetivo**: garantir que nenhum token OAuth é persistido em claro e que a renovação é transparente ao usuário.
**Motivação**: vazamento de token de conta social é risco crítico de segurança (ver R-15 em [risks/risk-matrix.md](../../risks/risk-matrix.md)); exigir reautenticação a cada expiração de access token frustraria o usuário sem necessidade.
**Arquivos envolvidos**: `apps/api/src/domain/channel-management/factories/SocialAccountFactory.ts`, `apps/api/src/domain/channel-management/policies/TokenRefreshPolicy.ts`, `apps/api/src/infrastructure/crypto/AesGcmEncryptor.ts`.
**Critérios de aceite**: token nunca persistido em claro; par `(channelId, platform)` único.
**Critérios de teste**: unitário (encrypt/decrypt round-trip; policy decide renovar/não renovar corretamente); segurança (log nunca expõe token).
**Checklist**: [ ] `APP_ENCRYPTION_KEY` vem de variável de ambiente.
**Dependências**: EPIC-02.F2.
**Labels**: `epic:EPIC-04`, `type:feature`, `layer:domain`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-04.F1.S1.T2 — OAuth YouTube (URL + callback) por canal
**Descrição**: implementar conexão de conta YouTube no contexto de um canal.
**Objetivo**: implementar RF-05 para YouTube.
**Motivação**: sem conta conectada, o Upload Worker não tem onde publicar — bloqueia o valor central do produto.
**Arquivos envolvidos**: `apps/api/src/infrastructure/adapters/youtube/YoutubeOAuthAdapter.ts`, `ConnectSocialAccountUseCase.ts`.
**Critérios de aceite**: conforme [api/social-accounts-api.md](../../api/social-accounts-api.md).
**Critérios de teste**: unitário (dublê do adapter); integração (state inválido, conta duplicada, canal ativa quando completo).
**Checklist**: [ ] evento `ChannelActivated` emitido corretamente.
**Dependências**: ISSUE-04.F1.S1.T1.
**Labels**: `epic:EPIC-04`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-04.F2.S1.T1 — OAuth TikTok (URL + callback) por canal
**Descrição**: implementar conexão de conta TikTok no contexto de um canal.
**Objetivo**: implementar RF-05 para TikTok.
**Motivação**: TikTok é plataforma-alvo desde o MVP; sem ela o produto entrega só metade da proposta (espelhamento).
**Arquivos envolvidos**: `apps/api/src/infrastructure/adapters/tiktok/TiktokOAuthAdapter.ts`.
**Critérios de aceite**: conforme [api/social-accounts-api.md](../../api/social-accounts-api.md).
**Critérios de teste**: mesmos casos do YouTube, adaptados.
**Checklist**: [ ] app TikTok em sandbox documentado para staging (ver R-06).
**Dependências**: ISSUE-04.F1.S1.T1.
**Labels**: `epic:EPIC-04`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-04.F3.S1.T1 — RefreshSocialAccountTokenUseCase (renovação automática)
**Descrição**: renovar access tokens automaticamente antes de expirarem.
**Objetivo**: eliminar a necessidade de reautenticação manual no caso comum (expiração de rotina).
**Motivação**: token expira eventualmente (é o caso mais comum de falha operacional do produto) — renovação silenciosa evita que isso vire um ponto de fricção diário.
**Arquivos envolvidos**: `apps/api/src/application/use-cases/channel-management/RefreshSocialAccountTokenUseCase.ts`.
**Critérios de aceite**: access token expirado é renovado silenciosamente na maioria dos casos; `NEEDS_REAUTH` só quando o refresh falha.
**Critérios de teste**: unitário (renovação bem-sucedida, falha, token ainda válido não renova à toa).
**Checklist**: [ ] nenhum log expõe token em qualquer cenário de erro.
**Dependências**: ISSUE-04.F1.S1.T1.
**Labels**: `epic:EPIC-04`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-04.F3.S1.T2 — Reautenticação manual e desconexão de conta
**Descrição**: implementar FA2 (quando renovação automática falha) e desconexão de conta social.
**Objetivo**: permitir recuperação de conta com refresh token inválido sem perder configuração do canal.
**Motivação**: sem reauth self-service, cada refresh token revogado viraria ticket de suporte.
**Arquivos envolvidos**: `apps/api/src/application/use-cases/channel-management/ReauthSocialAccountUseCase.ts`.
**Critérios de aceite**: conforme [api/social-accounts-api.md](../../api/social-accounts-api.md); desconexão de conta exigida reverte canal para `DRAFT` (FA7).
**Critérios de teste**: integração (desconexão de conta exigida reverte canal para `DRAFT` automaticamente).
**Checklist**: [ ] `PublishRecord` histórico não afetado por desconexão.
**Dependências**: ISSUE-04.F1.S1.T2, ISSUE-04.F2.S1.T1, ISSUE-04.F3.S1.T1.
**Labels**: `epic:EPIC-04`, `type:feature`, `layer:api`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).
