# Rate Limiting e Proteção contra Abuso

## Rate limit por rota

| Escopo | Limite | Janela | Aplica-se a |
|---|---|---|---|
| Por IP | 10 requisições | 1 minuto | `POST /v1/auth/login`, `POST /v1/auth/register` (proteção contra brute force/enumeração) |
| Por tenant | 100 requisições | 1 minuto | Todas as rotas autenticadas de `/v1/**` |
| Por IP | 1000 requisições | 1 minuto | Global, proteção genérica contra abuso/DDoS de camada de aplicação |
| Webhook Stripe | Sem limite próprio | — | Confiança delegada à verificação de assinatura, não a rate limit |

Implementado via Redis (contador com `INCR` + `EXPIRE`), no middleware da API — nunca em cada controller individualmente (RNF-09).

## Resposta de rate limit

`429 Too Many Requests` com header `Retry-After`, corpo no formato de erro padrão (`code: "RATE_LIMITED"`).

## Proteção contra abuso específica do domínio

| Vetor de abuso | Mitigação |
|---|---|
| Criação em massa de tenants/trial (abuso de plano gratuito) | Verificação de e-mail obrigatória antes de liberar geração automática; limite de tenants por IP/dia no cadastro |
| Reuso indevido de conteúdo entre canais (bypass da diversidade de IA) | `HighlightDiversityPolicy` é aplicada no domínio, não apenas na UI — não há endpoint que permita forçar highlight idêntico |
| Scraping da API pública de catálogo de nichos | Rate limit padrão + resposta cacheada (não há dado sensível em `GET /v1/niches`, mas volume alto ainda é limitado) |
| Tentativa de acesso cross-tenant via manipulação de ID em URL | Repositórios sempre filtram por `tenantId` do JWT (ver [domain/aggregates-repositories-factories.md](../domain/aggregates-repositories-factories.md)); resposta é sempre `404`, nunca `403`, para não confirmar existência do recurso em outro tenant |

## Helmet

`apps/api` usa Helmet com: CSP restritiva (sem `unsafe-inline` em produção), `Strict-Transport-Security` (HSTS, 1 ano, `includeSubDomains`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` (RNF-10).
