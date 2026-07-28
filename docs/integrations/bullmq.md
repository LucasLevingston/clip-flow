# Integração — BullMQ

## Propósito
Biblioteca de filas sobre Redis usada por toda comunicação assíncrona entre API e workers, e entre workers (ver [ADR-0003](../adr/0003-node-workers-bullmq.md), [ADR-0010](../adr/0010-queue-redis-bullmq.md)).

## Uso no pipeline
- Um `Queue` (producer) por fila nomeada: `video`, `scheduler`, `ai`, `upload`, `analytics`, `notification`, `health`.
- Um `Worker` (consumer) por processo worker, consumindo exatamente sua fila.
- `Scheduler Worker` usa **repeatable jobs** (padrão cron) para disparo diário do lote de geração por `Channel` (ver [ADR-0012](../adr/0012-batch-generation-delayed-publish.md)).
- Cada fila configura: concorrência, número de tentativas (`attempts`), estratégia de backoff (`backoff: { type: 'exponential', delay }`), e `removeOnComplete`/`removeOnFail` com retenção limitada (evita crescimento ilimitado do Redis).

## Dead-letter
Jobs que esgotam tentativas permanecem na fila com status `failed` (dead-letter nativo do BullMQ) até serem inspecionados pelo Health Worker/admin console ou expirarem por política de retenção.

## Erros tratados
| Erro | Tratamento |
|---|---|
| Job trava sem `ack` (worker crashou) | BullMQ retorna o job à fila automaticamente após timeout de lock (RNF-17) |
| Redis indisponível | Producers falham a enfileirar; API retorna erro ao cliente (nunca perde a requisição silenciosamente); workers reconectam com backoff |

## Segredos necessários
`REDIS_URL` (com TLS em produção).
