# API — Índice e Convenções

## Versionamento

Todas as rotas são prefixadas por versão: `/v1/...`. Mudança incompatível (breaking change) sobe para `/v2/...`; `/v1` permanece disponível por no mínimo 6 meses após depreciação anunciada.

## Autenticação e Autorização

- Rotas de tenant exigem `Authorization: Bearer <JWT>`, emitido por `POST /v1/auth/login` (ver [security/authentication-authorization.md](../security/authentication-authorization.md)).
- Rotas administrativas (`/v1/admin/**`) exigem, além do JWT, `user.isPlatformAdmin = true`.
- Toda rota que muta dado de tenant valida `Membership.role` mínimo exigido (RBAC — ver tabela de cada endpoint).

## Formato de erro padrão

```json
{
  "error": {
    "code": "PLAN_LIMIT_EXCEEDED",
    "message": "Limite de nichos do plano atual foi atingido.",
    "details": { "limit": 1, "current": 1 }
  }
}
```

Códigos de erro são estáveis e documentados por endpoint — clientes devem tratar por `code`, nunca por `message` (texto pode mudar).

## Convenção de paginação

Query params: `?page=1&pageSize=20` (máx. `pageSize=100`). Resposta:

```json
{ "data": [...], "meta": { "page": 1, "pageSize": 20, "total": 134 } }
```

## Domínios documentados

| Arquivo                                          | Domínio                                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [auth-api.md](auth-api.md)                       | Autenticação e sessão                                                                  |
| [members-api.md](members-api.md)                 | Convite, aceite e papéis de membros do tenant                                          |
| [channels-api.md](channels-api.md)               | Criação e configuração de canais (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)) |
| [niches-api.md](niches-api.md)                   | Catálogo de nichos (somente leitura)                                                   |
| [subscriptions-api.md](subscriptions-api.md)     | Planos e billing                                                                       |
| [social-accounts-api.md](social-accounts-api.md) | Conexão de contas sociais por canal                                                    |
| [videos-api.md](videos-api.md)                   | Histórico e detalhe de vídeos gerados                                                  |
| [analytics-api.md](analytics-api.md)             | Métricas de desempenho e insights de canal                                             |
| [billing-api.md](billing-api.md)                 | Webhooks e portal de pagamento (Stripe)                                                |
| [notifications-api.md](notifications-api.md)     | Notificações in-app                                                                    |
| [admin-api.md](admin-api.md)                     | Console administrativo (nichos, moderação, saúde)                                      |

## Padrão de documentação por endpoint

Cada endpoint neste conjunto de documentos segue: **Objetivo · Entrada · Saída · Validações · Autorização · Erros possíveis · Exemplo**.
