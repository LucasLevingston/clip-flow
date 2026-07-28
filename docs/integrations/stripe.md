# Integração — Stripe (suplementar)

> Não estava na lista original de integrações do briefing, mas é necessária para RF-08 (Billing) e é referenciada por [api/billing-api.md](../api/billing-api.md) e [ADR-0007](../adr/0007-deploy-target-vercel-railway.md). Documentada aqui para manter a base de conhecimento consistente.

## Propósito
Gateway de pagamento para assinaturas recorrentes dos planos SaaS.

## Uso no pipeline
- `POST /v1/billing/checkout-session` cria sessão de checkout.
- `POST /v1/billing/webhooks/stripe` recebe eventos e sincroniza `Subscription.status`.
- Stripe Customer Portal usado para autoatendimento (troca de cartão, histórico de fatura) — evita construir UI de billing própria no MVP.

## Erros tratados
| Erro | Tratamento |
|---|---|
| Assinatura de webhook inválida | Rejeitada com 400, sem processar payload |
| Evento desconhecido/não mapeado | Ignorado com log, resposta 200 (Stripe não deve re-tentar indefinidamente) |
| `invoice.payment_failed` | `Subscription.status = PAST_DUE`, notifica tenant |

## Segredos necessários
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY` (frontend).
