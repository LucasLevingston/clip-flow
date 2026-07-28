# Integração — Provedor de E-mail Transacional (suplementar)

> Não estava na lista original de integrações do briefing, mas é necessária para RF-12 (Notificações). Documentada aqui para manter a base de conhecimento consistente.

## Propósito
Envio de e-mails transacionais: boas-vindas, publicação concluída, falha de publicação, conta precisa reautenticar, cobrança falhou.

## Provedor recomendado
Resend ou SendGrid (definir na Sprint 0 — ver [roadmap/roadmap.md](../roadmap/roadmap.md)); interface `EmailSender` no domínio é agnóstica ao provedor escolhido (DIP), permitindo troca sem impacto no Notification Worker.

## Uso no pipeline
`Notification Worker` chama `EmailSender.send(template, recipient, variables)`. Templates versionados junto ao código (`apps/workers/src/notification/templates/`).

## Erros tratados
| Erro | Tratamento |
|---|---|
| Falha de envio (provedor fora do ar) | Retry (ver [workers/notification-worker.md](../workers/notification-worker.md)) |
| E-mail inválido/rejeitado (bounce) | Log, sem retry (falha permanente) |

## Segredos necessários
`EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM_ADDRESS`.
