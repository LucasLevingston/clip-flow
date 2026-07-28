# EPIC-04 — Contas Sociais do Canal

Cobre RF-05. Revisado após [ADR-0011](../../adr/0011-channel-as-aggregate.md) — contas sociais agora são conectadas no contexto de um `Channel`, não do tenant diretamente.

## Feature EPIC-04.F1 — Conexão OAuth YouTube

### História EPIC-04.F1.S1 — Fluxo OAuth completo

**EPIC-04.F1.S1.T1 — `SocialAccountFactory` + criptografia de tokens + `TokenRefreshPolicy`**
- Objetivo: base de domínio compartilhada por YouTube e TikTok, incluindo renovação automática.
- Descrição: `SocialAccountFactory.create()` recebe tokens em claro do callback OAuth e retorna `SocialAccount` com `EncryptedToken` (ver [security/secrets-encryption.md](../../security/secrets-encryption.md)); `TokenRefreshPolicy` decide quando renovar proativamente via refresh token.
- Arquivos: `apps/api/src/domain/channel-management/factories/SocialAccountFactory.ts`, `apps/api/src/domain/channel-management/policies/TokenRefreshPolicy.ts`, `apps/api/src/infrastructure/crypto/AesGcmEncryptor.ts`.
- Dependências: EPIC-02.F2 (Channel deve existir).
- Critérios de aceite: token nunca persistido em claro; `EncryptedToken.keyVersion`/`refreshExpiresAt` registrados; par `(channelId, platform)` único.
- Testes obrigatórios: unitário (encrypt/decrypt round-trip; policy decide renovar/não renovar corretamente); teste de segurança (serialização de `SocialAccount` nunca expõe `encryptedTokens` em log).
- Estimativa: 5 pontos.
- Checklist: [ ] `APP_ENCRYPTION_KEY` vem de variável de ambiente, nunca hardcoded.

**EPIC-04.F1.S1.T2 — `GET /v1/channels/:channelId/social-accounts/youtube/oauth-url` + `POST .../oauth-callback`**
- Objetivo: implementar RF-05 para YouTube (ver [integrations/youtube.md](../../integrations/youtube.md)).
- Descrição: geração de `state` anti-CSRF, troca de `code` por tokens, criação de `SocialAccount` vinculada ao canal; avalia transição `Channel.status: DRAFT → ACTIVE`.
- Arquivos: `apps/api/src/infrastructure/adapters/youtube/YoutubeOAuthAdapter.ts`, `ConnectSocialAccountUseCase.ts`.
- Dependências: EPIC-04.F1.S1.T1.
- Critérios de aceite: conforme [api/social-accounts-api.md](../../api/social-accounts-api.md).
- Testes obrigatórios: unitário do Use Case (dublê do adapter OAuth); integração (state inválido rejeitado, conta duplicada rejeitada, canal ativa quando plataformas exigidas completas).
- Estimativa: 5 pontos.
- Checklist: [ ] evento `ChannelActivated` emitido corretamente quando aplicável.

## Feature EPIC-04.F2 — Conexão OAuth TikTok

### História EPIC-04.F2.S1 — Fluxo OAuth completo

**EPIC-04.F2.S1.T1 — `GET /v1/channels/:channelId/social-accounts/tiktok/oauth-url` + `POST .../oauth-callback`**
- Objetivo: implementar RF-05 para TikTok (ver [integrations/tiktok.md](../../integrations/tiktok.md)).
- Descrição: mesmo padrão do YouTube, reaproveitando `SocialAccountFactory`; `TiktokOAuthAdapter` implementa a mesma interface de adapter OAuth.
- Arquivos: `apps/api/src/infrastructure/adapters/tiktok/TiktokOAuthAdapter.ts`.
- Dependências: EPIC-04.F1.S1.T1.
- Critérios de aceite: conforme [api/social-accounts-api.md](../../api/social-accounts-api.md).
- Testes obrigatórios: mesmos casos do YouTube, específicos para TikTok.
- Estimativa: 3 pontos (reaproveita base do YouTube).
- Checklist: [ ] app TikTok em modo sandbox documentado para `staging` (ver [risks/risk-matrix.md](../../risks/risk-matrix.md), R-06).

## Feature EPIC-04.F3 — Reautenticação, Renovação e Desconexão

### História EPIC-04.F3.S1 — Ciclo de vida da conta

**EPIC-04.F3.S1.T1 — `RefreshSocialAccountTokenUseCase` (renovação automática)**
- Objetivo: renovar access tokens automaticamente antes de expirarem, sem envolver o usuário.
- Descrição: invocado por Upload/Analytics Worker antes de cada uso do token, aplicando `TokenRefreshPolicy`; falha de renovação (refresh token inválido) transiciona `SocialAccount.status = NEEDS_REAUTH`.
- Arquivos: `apps/api/src/application/use-cases/channel-management/RefreshSocialAccountTokenUseCase.ts`.
- Dependências: EPIC-04.F1.S1.T1.
- Critérios de aceite: access token expirado é renovado silenciosamente na maioria dos casos; `NEEDS_REAUTH` só ocorre quando o refresh falha.
- Testes obrigatórios: unitário (renovação bem-sucedida, renovação falha, token ainda válido não renova à toa).
- Estimativa: 3 pontos.
- Checklist: [ ] nenhum log expõe token em qualquer cenário de erro.

**EPIC-04.F3.S1.T2 — `POST .../reauth` + `DELETE .../social-accounts/:id`**
- Objetivo: implementar FA2 (reautenticação manual, quando renovação automática falhou) e desconexão.
- Descrição: reaplica fluxo OAuth a conta existente; desconexão faz soft delete e volta `Channel.status` para `DRAFT` se a conta era exigida por `Channel.platforms` (FA7).
- Arquivos: `apps/api/src/application/use-cases/channel-management/ReauthSocialAccountUseCase.ts`.
- Dependências: EPIC-04.F1, EPIC-04.F2, EPIC-04.F3.S1.T1.
- Critérios de aceite: conforme [api/social-accounts-api.md](../../api/social-accounts-api.md).
- Testes obrigatórios: integração (desconexão de conta exigida reverte canal para `DRAFT` automaticamente).
- Estimativa: 3 pontos.
- Checklist: [ ] `PublishRecord` histórico não é afetado por desconexão.
