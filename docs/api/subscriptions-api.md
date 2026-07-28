# API — Planos e Assinatura SaaS

## `GET /v1/plans`
**Objetivo**: lista planos disponíveis para contratação.
**Saída (200)**: lista de `{ id, name, maxChannels, maxVideosPerDayPerChannel, priceCents }`
**Autorização**: pública (usada também na landing/pricing).
**Erros**: nenhum.

---

## `GET /v1/subscription`
**Objetivo**: retorna assinatura atual do tenant e uso vs. limites (RF-08).
**Saída (200)**:
```json
{ "plan": { "id": "uuid", "name": "PRO" }, "status": "ACTIVE", "currentPeriodEnd": "iso-date",
  "usage": { "channels": { "current": 2, "max": 3 } } }
```
**Autorização**: `role ∈ {OWNER, ADMIN}`.
**Erros**: `UNAUTHORIZED` (401).

---

## `POST /v1/subscription/change-plan`
**Objetivo**: troca de plano (upgrade/downgrade).
**Entrada**: `{ "planId": "uuid" }`
**Saída (200)**: `Subscription` atualizado.
**Validações**: se downgrade viola limite atual (ex.: mais canais ativos que o novo plano permite), bloqueia e retorna quais itens excedem.
**Autorização**: `role = OWNER`.
**Erros**: `DOWNGRADE_BLOCKED_BY_USAGE` (422, com `details.exceeding`), `PLAN_NOT_FOUND` (404).

---

## `POST /v1/subscription/cancel`
**Objetivo**: cancela assinatura ao fim do período pago (RF fluxo alternativo FA6).
**Saída (200)**: `{ "status": "CANCELED", "effectiveAt": "iso-date" }`
**Autorização**: `role = OWNER`.
**Erros**: `SUBSCRIPTION_ALREADY_CANCELED` (409).

---

## `GET /v1/subscription/portal`
**Objetivo**: retorna URL do portal de billing (Stripe Customer Portal) para gestão de cartão/fatura.
**Saída (200)**: `{ "url": "https://billing.stripe.com/..." }`
**Autorização**: `role = OWNER`.
**Erros**: `STRIPE_CUSTOMER_NOT_FOUND` (404).
