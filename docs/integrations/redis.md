# Integração — Redis

## Propósito
Backend de filas (BullMQ) e cache de curto prazo (ex.: resultado de health-check, rate limiting por IP/tenant).

## Uso no pipeline
- Filas BullMQ (ver [integrations/bullmq.md](bullmq.md)).
- Cache de rate limiting (contadores com TTL — ver [security/rate-limiting-abuse.md](../security/rate-limiting-abuse.md)).
- Cache opcional de leitura frequente (ex.: catálogo de nichos ativos), com invalidação por evento administrativo (`Niche` alterado).

## Erros tratados
| Erro | Tratamento |
|---|---|
| Indisponibilidade momentânea | Reconexão automática com backoff (cliente Redis); rate limiting degrada para "permitir" (fail-open) em vez de bloquear todo o tráfego, com alerta ao Health Worker |

## Segredos necessários
`REDIS_URL` — gerenciado (Railway/Upstash), com TLS habilitado em produção (ver [ADR-0007](../adr/0007-deploy-target-vercel-railway.md)).
