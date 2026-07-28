# Observabilidade

## Logs
Estruturados (JSON), correlacionados por `traceId`/`tenantId`/`jobId` (ver [security/logging-security.md](../security/logging-security.md) para regras de segurança de log). Agregados em serviço gerenciado leve (ex.: Better Stack/Axiom) integrado à plataforma de deploy — sem operar stack própria (ELK) no MVP, alinhado a [ADR-0007](../adr/0007-deploy-target-vercel-railway.md).

## Tracing
Cada `GeneratedVideo` carrega um `traceId` desde o disparo do Scheduler até a publicação — propagado em todo payload de job (ver [architecture/worker-flow.md](../architecture/worker-flow.md)). No MVP, tracing é reconstruído via busca de log por `traceId` (não é distributed tracing formal com OpenTelemetry); adotar OpenTelemetry é item de growth se a cadeia de debugging se tornar difícil de correlacionar manualmente.

## Métricas

| Categoria | Métrica | Fonte |
|---|---|---|
| Negócio | Vídeos gerados/dia, taxa de sucesso do pipeline, tempo médio ponta a ponta | Agregação sobre `GeneratedVideo`/`PublishRecord` |
| Negócio | Custo médio de IA por vídeo | Agregação sobre registros de custo por chamada (RNF-21) |
| Técnica | Profundidade de fila por domínio, taxa de falha por worker | Health Worker (RF-16) |
| Técnica | Latência p95 da API | Middleware de métricas da API |
| Técnica | Disponibilidade de cada integração externa | Health Worker |

## Health Checks

- `GET /v1/admin/health` (ver [api/admin-api.md](../api/admin-api.md)) expõe status agregado.
- Cada worker expõe endpoint de liveness mínimo (`/healthz`) para a plataforma de deploy reiniciar réplicas travadas — não confundir com o Health Worker de negócio (que monitora filas/integrações, não o próprio processo).

## Alertas

Canal: Slack/e-mail da equipe (não do tenant). Disparados pelo Health Worker (ver [workers/health-worker.md](../workers/health-worker.md)):
- Fila acima de limiar (`QueueThresholdExceeded`).
- Integração externa degradada (`IntegrationDegraded`).
- Taxa de erro do pipeline acima de 10% em janela de 1h.
- Custo médio de IA por vídeo acima do limiar configurado (RNF-22).

## Dashboard operacional

Admin console (RF-16) exibe: filas em tempo real, últimas falhas por worker, status de integrações, custo agregado do dia/mês. Não é um produto de observabilidade genérico — é dashboard de domínio, construído sobre os dados já modelados (`platform_health_snapshot`, registros de custo).
