# Health Worker

## Responsabilidade
Monitorar continuamente a profundidade e a taxa de falha das filas, o status dos demais workers e a disponibilidade das integrações externas, alimentando o admin console (RF-16) e disparando alertas (RNF-20).

## Entradas
- Cron interno (a cada 1 min) — não consome jobs de negócio de outros workers.
- Lê estado das filas via API do BullMQ (waiting, active, failed, delayed count por fila).
- Executa health-check leve (ping/status) contra YouTube, TikTok, Claude, OpenAI, Whisper, Stripe, provedor de e-mail.

## Saídas
- Grava snapshot de saúde no banco (`platform_health_snapshot`) e/ou cache Redis de curta duração.
- Dispara evento de alerta (`QueueThresholdExceeded`, `IntegrationDegraded`) consumido pelo Notification Worker (canal interno de administração, distinto das notificações de tenant).

## Fila
- Consome: `health` (apenas jobs de configuração/trigger manual; a checagem periódica é cron interno, não fila)
- Produz: `notification` (alertas administrativos)

## Eventos
- Consumido: nenhum evento de negócio
- Publicado: `QueueThresholdExceeded`, `IntegrationDegraded`

## Regras de alerta
| Condição | Alerta |
|---|---|
| Fila com `waiting > 50` por mais de 5 min | `QueueThresholdExceeded` |
| Taxa de falha de uma fila > 10% nas últimas 100 execuções | `QueueThresholdExceeded` (severidade alta) |
| Integração externa falha em 3 health-checks consecutivos | `IntegrationDegraded` |

## Tratamento de erros
Falha do próprio Health Worker (ex.: não conseguiu consultar o Redis) é logada com severidade crítica e re-tentada na próxima execução de cron — não há dead-letter aqui, pois é um processo cíclico, não um job único.

## Retries
Não aplicável no sentido tradicional — cada ciclo de cron é independente; falha em um ciclo não impede o próximo.

## Timeout
20 segundos por ciclo completo de verificação.
