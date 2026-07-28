# Scheduler Worker

## Responsabilidade
Manter os repeatable jobs do BullMQ sincronizados com os `Channel` ativos e disparar, uma vez por dia no `generationTime` de cada canal, um lote de `GenerationScheduled` (um por vídeo do dia), respeitando pré-condições de negócio (ver [architecture/scheduler-flow.md](../architecture/scheduler-flow.md), [ADR-0012](../adr/0012-batch-generation-delayed-publish.md)).

## Entradas
- Jobs de controle da fila `scheduler`: `RegisterChannelJob`, `RemoveChannelJob` (publicados pela API quando o tenant cria/altera/pausa/remove um `Channel`).
- Disparo diário: repeatable job do próprio BullMQ (cron por `Channel.generationTime`).
- Lê de banco: `Channel`, `Subscription.status`, `SocialAccount.status` (via `IsChannelReadyToPublishSpecification`), `SourceVideo` disponível.

## Saídas
- N jobs `GenerationScheduled` na fila `ai` (um por vídeo do lote), cada um já com `scheduledPublishAt` alocado a partir de `Channel.publishTimes`.
- Em caso de bloqueio total (canal não pronto) ou parcial (pool insuficiente), evento de alerta é publicado.

## Fila
- Consome: `scheduler`
- Produz: `ai`, `notification` (alertas)

## Eventos
- Consumido: (comandos internos `RegisterChannelJob`/`RemoveChannelJob`, não eventos de domínio externos)
- Publicado: `GenerationScheduled` (N por disparo)

## Tratamento de erros
| Erro | Ação |
|---|---|
| Pool de `SourceVideo` insuficiente (FA1) | Gera o máximo possível com as fontes disponíveis; publica alerta interno para administração via `notification` |
| Canal não pronto — `IsChannelReadyToPublishSpecification` falha (FA7) | Pula esta execução; nenhum vídeo é gerado para o canal neste dia |
| Falha de leitura do banco | Retry padrão (5 tentativas, backoff exponencial); alimenta Health Worker se persistir |

## Retries
5 tentativas, backoff exponencial base 5s. Falha do próprio disparo (não do pipeline downstream) é rara — geralmente indica indisponibilidade do banco.

## Timeout
60 segundos por execução (verificação de pré-condição + alocação de `scheduledPublishAt` + enfileiramento de até `videosPerDay` jobs — ainda não é processamento pesado).

## Idempotência
Ver [architecture/scheduler-flow.md](../architecture/scheduler-flow.md) — `batchRunId` determinístico (`channelId` + data) evita disparo duplicado do lote no mesmo dia; cada vídeo do lote é ainda identificado unicamente por `(channelId, batchRunId, scheduledPublishAt)`.
