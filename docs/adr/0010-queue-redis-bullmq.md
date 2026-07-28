# ADR-0010 — Fila de Jobs: Redis + BullMQ

## Status
Aceito

## Problema
Complementar ao [ADR-0003](0003-node-workers-bullmq.md): definir especificamente a tecnologia de fila que sustenta a comunicação assíncrona entre API, Scheduler e os demais workers.

## Alternativas
1. **Redis + BullMQ** — filas nomeadas, prioridade, delay, repeatable jobs (cron), retries com backoff, dead-letter queue nativos.
2. **RabbitMQ** — modelo de exchange/routing mais flexível, porém maior complexidade operacional para o caso de uso (filas simples ponto-a-ponto por domínio).
3. **Postgres como fila (via tabela + polling)** — sem dependência nova, porém pior latência e maior carga no banco primário.

## Escolha
**Redis + BullMQ**, com uma fila nomeada por domínio de worker: `video`, `scheduler`, `ai`, `upload`, `analytics`, `notification`, `health`.

## Consequências
- `Scheduler Worker` usa **repeatable jobs** do BullMQ (cron pattern) para dispachar execuções diárias por `(tenant, niche)`, eliminando necessidade de um scheduler externo separado.
- Cada fila tem configuração própria de concorrência, prioridade e retry, isolando falhas por domínio (RNF-13/RNF-16).
- Redis gerenciado (Railway/Upstash) evita operação própria de cluster Redis no MVP.
- Dead-letter queue por fila alimenta o Health Worker e alertas de observabilidade (RNF-20).

## Trade-offs
- RabbitMQ (alternativa 2) foi rejeitado por complexidade operacional desnecessária para o padrão de uso (sem necessidade de roteamento complexo/exchange topology).
- Fila via Postgres (alternativa 3) foi rejeitada por acoplar carga assíncrona de alto volume ao banco transacional primário, arriscando RNF-01 (latência da API) e RNF-14 (escalabilidade do banco).
