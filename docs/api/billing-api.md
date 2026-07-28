# API — Billing (Stripe)

## `POST /v1/billing/webhooks/stripe`
**Objetivo**: recebe eventos assíncronos do Stripe (pagamento confirmado, falha de cobrança, assinatura cancelada) para sincronizar `Subscription.status`.
**Entrada**: payload bruto do Stripe (assinado).
**Saída (200)**: `{ "received": true }`
**Validações**: assinatura do webhook (`Stripe-Signature` header) verificada com o secret configurado — requisição sem assinatura válida é rejeitada antes de qualquer processamento.
**Autorização**: nenhuma sessão de usuário — autenticação é a verificação de assinatura do webhook.
**Eventos tratados**: `invoice.paid` → `Subscription.status = ACTIVE`; `invoice.payment_failed` → `Subscription.status = PAST_DUE` + `PlanLimitReached`/aviso; `customer.subscription.deleted` → `Subscription.status = CANCELED`.
**Erros**: `INVALID_SIGNATURE` (400), `UNHANDLED_EVENT_TYPE` (200, ignorado e logado — Stripe não deve receber erro por evento não mapeado).

---

## `POST /v1/billing/checkout-session`
**Objetivo**: cria sessão de checkout Stripe para contratação/upgrade de plano.
**Entrada**: `{ "planId": "uuid" }`
**Saída (200)**: `{ "checkoutUrl": "https://checkout.stripe.com/..." }`
**Autorização**: `role = OWNER`.
**Erros**: `PLAN_NOT_FOUND` (404), `STRIPE_ERROR` (502).
