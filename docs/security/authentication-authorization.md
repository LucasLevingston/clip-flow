# Autenticação e Autorização

## JWT

- **Access token**: JWT assinado com RS256, expiração 15 minutos, payload mínimo (`sub` = userId, `tenantId`, `role`, `isPlatformAdmin`).
- **Refresh token**: JWT opaco/rotativo, expiração 7 dias, armazenado em cookie `httpOnly`, `Secure`, `SameSite=Strict`. Rotação a cada uso — refresh token antigo é invalidado ao emitir um novo (mitiga replay de token roubado).
- Chaves de assinatura (par RSA) versionadas (`kid` no header do JWT), permitindo rotação sem invalidar sessões existentes.

## Refresh Token

- Armazenado hasheado no banco (nunca em texto puro), associado a `userId` + `deviceInfo` opcional.
- Endpoint `POST /v1/auth/refresh` (ver [api/auth-api.md](../api/auth-api.md)) valida hash, rotaciona e retorna novo access token.
- Logout (`POST /v1/auth/logout`) revoga o refresh token corrente imediatamente.

## RBAC

| Papel | Escopo | Permissões-chave |
|---|---|---|
| `OWNER` | Tenant | Tudo, incluindo billing, remoção de membros, exclusão do tenant |
| `ADMIN` | Tenant | Tudo exceto billing e remoção de `OWNER` |
| `MEMBER` | Tenant | Leitura (dashboard, histórico, analytics); sem escrita em nichos/agendas/contas sociais |
| `PLATFORM_ADMIN` | Plataforma (fora do tenant) | Console administrativo (RF-15): nichos, curadoria de conteúdo-fonte, moderação, saúde |

`PLATFORM_ADMIN` é um flag no `User` (`isPlatformAdmin`), independente de qualquer `Membership` — um platform admin não precisa pertencer a nenhum tenant específico para operar o console administrativo.

## Middleware de autorização

Toda rota protegida passa por dois checks compostos, na ordem:
1. **Autenticação**: JWT válido, não expirado, assinatura correta → resolve `userId`, `tenantId` (do token, nunca de parâmetro de URL/body — evita troca de tenant por manipulação de payload), `role`.
2. **Autorização**: decorator/middleware declarativo por rota especifica papel mínimo exigido (`requireRole(['OWNER', 'ADMIN'])`) ou `requirePlatformAdmin()`.

Nenhum controller implementa checagem de papel manualmente dentro do corpo do handler — a regra vive centralizada no middleware, para não haver rota protegida "esquecida" (RNF-06).

## Isolamento entre tenants

`tenantId` do JWT é a única fonte de verdade de escopo — nunca aceito como parâmetro de request para determinar de qual tenant ler/escrever dado. Repositórios aplicam o filtro automaticamente (ver [domain/aggregates-repositories-factories.md](../domain/aggregates-repositories-factories.md)).

## Autenticação de workers/serviços internos

Workers não expõem HTTP e não passam por este fluxo — autenticam-se ao banco/Redis via credencial de serviço própria (secret de ambiente), sem conceito de usuário/sessão.
