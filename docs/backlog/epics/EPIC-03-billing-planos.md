# EPIC-03 — Billing & Planos

Cobre RF-08.

## Feature EPIC-03.F1 — Planos e Assinatura

### História EPIC-03.F1.S1 — Consulta de planos e uso

**EPIC-03.F1.S1.T1 — Domain: `Plan`, `Subscription` + `GET /v1/plans`, `GET /v1/subscription`**
- Objetivo: expor planos disponíveis e uso atual do tenant.
- Descrição: entidades e `PlanLimitsCalculator` (ver [domain/domain-services-application-services.md](../../domain/domain-services-application-services.md)).
- Arquivos: `apps/api/src/domain/billing/entities/*.ts`, `apps/api/src/domain/billing/services/PlanLimitsCalculator.ts`, controllers.
- Dependências: EPIC-01.
- Critérios de aceite: conforme [api/subscriptions-api.md](../../api/subscriptions-api.md).
- Testes obrigatórios: unitário do calculador (limites vs. uso); integração do endpoint.
- Estimativa: 3 pontos.
- Checklist: [ ] planos do seed condizem com os limites documentados em [domain/entities-value-objects.md](../../domain/entities-value-objects.md).

**EPIC-03.F1.S1.T2 — `ChangePlanUseCase` (upgrade/downgrade) + `POST /v1/subscription/change-plan`**
- Objetivo: permitir troca de plano com validação de downgrade.
- Descrição: bloqueia downgrade que viola uso atual, retornando itens excedentes.
- Arquivos: `apps/api/src/application/use-cases/billing/ChangePlanUseCase.ts`.
- Dependências: EPIC-03.F1.S1.T1.
- Critérios de aceite: conforme [api/subscriptions-api.md](../../api/subscriptions-api.md) — `DOWNGRADE_BLOCKED_BY_USAGE`.
- Testes obrigatórios: unitário (cenários de downgrade válido/inválido).
- Estimativa: 5 pontos.
- Checklist: [ ] upgrade nunca bloqueado por uso.

## Feature EPIC-03.F2 — Integração Stripe

### História EPIC-03.F2.S1 — Checkout e Webhook

**EPIC-03.F2.S1.T1 — `POST /v1/billing/checkout-session`**
- Objetivo: iniciar contratação/upgrade via Stripe Checkout.
- Descrição: cria sessão de checkout associada ao `tenantId`/`planId` (ver [integrations/stripe.md](../../integrations/stripe.md)).
- Arquivos: `apps/api/src/infrastructure/adapters/stripe/StripeCheckoutAdapter.ts`.
- Dependências: EPIC-03.F1.S1.T1.
- Critérios de aceite: conforme [api/billing-api.md](../../api/billing-api.md).
- Testes obrigatórios: integração com Stripe em modo teste (chave sandbox), fallback para dublê se indisponível em CI.
- Estimativa: 5 pontos.
- Checklist: [ ] `STRIPE_SECRET_KEY` nunca logada.

**EPIC-03.F2.S1.T2 — Webhook Stripe (`invoice.paid`, `payment_failed`, `subscription.deleted`)**
- Objetivo: sincronizar `Subscription.status` com eventos do Stripe.
- Descrição: validação de assinatura obrigatória antes de processar; idempotência por `event.id`.
- Arquivos: `apps/api/src/interface/http/controllers/billing-webhook.controller.ts`.
- Dependências: EPIC-03.F2.S1.T1.
- Critérios de aceite: conforme [api/billing-api.md](../../api/billing-api.md) — assinatura inválida rejeitada com 400.
- Testes obrigatórios: unitário (mapeamento evento → status); integração (payload assinado real de sandbox).
- Estimativa: 5 pontos.
- Checklist: [ ] evento duplicado (retry do Stripe) não aplica efeito duas vezes.
