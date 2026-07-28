# Notification Worker

## Responsabilidade
Consumir eventos de todos os demais contextos e traduzi-los em notificações in-app e e-mails transacionais, respeitando preferências do usuário (RF-12).

## Entradas
- Jobs da fila `notification`, um por evento relevante: `TenantCreated`, `SocialAccountConnected`, `SocialAccountNeedsReauth`, `VideoContentGenerationFailed`, `VideoFlaggedForModeration`, `VideoProcessingFailed`, `VideoPublished`, `VideoPublishFailed`, `PlanLimitReached`.
- Lê de banco: `NotificationPreference` do(s) usuário(s) do tenant.

## Saídas
- Cria `Notification` in-app.
- Envia e-mail transacional (se `NotificationPreference.emailEnabled` para a categoria).

## Fila
- Consome: `notification`
- Produz: nenhuma (worker terminal)

## Eventos
- Consumido: todos os eventos listados acima (ver [architecture/event-flow.md](../architecture/event-flow.md))
- Publicado: nenhum

## Tratamento de erros
| Erro | Ação |
|---|---|
| Falha de envio de e-mail (provedor fora do ar) | Retry; `Notification` in-app já foi criada independentemente (não depende do sucesso do e-mail) |
| Usuário sem `NotificationPreference` configurada | Aplica padrão: e-mail habilitado para categorias críticas (`VideoPublishFailed`, `SocialAccountNeedsReauth`), desabilitado para informativas |

## Retries
3 tentativas, backoff exponencial base 10s, aplicado apenas ao envio de e-mail (a notificação in-app é gravação síncrona de baixa probabilidade de falha, sem retry separado).

## Timeout
15 segundos por job.

## SLA
E-mail transacional enviado em até 1 minuto do evento (RF-12).
