# Secrets e Criptografia

## Dados sensíveis identificados

| Dado | Onde vive | Proteção |
|---|---|---|
| Tokens OAuth (YouTube/TikTok) | `SocialAccount.encryptedTokens` (por canal — ver [ADR-0011](../adr/0011-channel-as-aggregate.md)) | AES-256-GCM, chave de aplicação (não a chave do banco) |
| Senha de usuário | `User.passwordHash` | bcrypt (custo ≥ 12), nunca reversível |
| Chaves de API de terceiros (Claude, OpenAI, Stripe, etc.) | Variáveis de ambiente do serviço | Nunca commitadas; gerenciadas pelo secret manager da plataforma de deploy |
| JWT signing key | Variável de ambiente (par RSA) | Rotação versionada (`kid`) |

## Criptografia em repouso

- `EncryptedToken` (VO — ver [domain/entities-value-objects.md](../domain/entities-value-objects.md)) usa AES-256-GCM com `keyVersion` explícito, permitindo rotação de chave de criptografia sem invalidar tokens existentes (re-encriptação em lote possível).
- Chave de criptografia de aplicação (`APP_ENCRYPTION_KEY`) é distinta da credencial de banco — comprometer o banco sozinho não expõe tokens em texto claro.

## Renovação automática de token vs. reautenticação manual

- `EncryptedToken` armazena `refreshExpiresAt`. `TokenRefreshPolicy` (ver [domain/policies-specifications.md](../domain/policies-specifications.md)) decide, antes de cada uso do access token (ou proativamente, faltando < 10 min para expirar), se deve renová-lo silenciosamente usando o refresh token — sem qualquer ação do usuário (FA2 revisado).
- `SocialAccount.status` só transiciona para `NEEDS_REAUTH` quando o **próprio refresh token** falha (revogado pelo usuário na plataforma, expirado por política da plataforma, ou inválido) — nunca por expiração rotineira do access token, que é tratada de forma transparente.
- A renovação automática é responsabilidade de quem for consumir o token (Upload Worker, Analytics Worker) — nunca é feita antecipadamente por um worker dedicado só a isso, para não introduzir mais um ponto de falha assíncrono.

## Criptografia em trânsito

TLS 1.2+ obrigatório em todas as chamadas HTTP externas (RNF-08) — validado por padrão pelos SDKs oficiais usados (Stripe, YouTube, TikTok, Claude, OpenAI).

## Gestão de secrets por ambiente

- `development`: `.env.local`, nunca commitado (`.gitignore`), com `.env.example` documentando todas as chaves necessárias sem valores reais (ver [ENVIRONMENT.md](../ENVIRONMENT.md)).
- `staging`/`production`: secret manager da plataforma de deploy (Vercel Environment Variables, Railway/Render Secrets) — nunca lidos de arquivo no repositório.
- Rotação de secrets críticos (JWT signing key, `APP_ENCRYPTION_KEY`) documentada como procedimento operacional em [TROUBLESHOOTING.md](../TROUBLESHOOTING.md).

## Regra de logging

Nenhum log (estruturado ou não) contém: senha, token de acesso/refresh (interno ou de terceiro), chave de API, ou payload bruto de webhook antes de validação de assinatura. Campos sensíveis são explicitamente redigidos (`***`) por um serializer de log compartilhado — nunca deixado a critério de cada worker individualmente.
