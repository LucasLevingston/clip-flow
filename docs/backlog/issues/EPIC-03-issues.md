# Issues — EPIC-03 Billing & Planos

---

### ISSUE-03.F1.S1.T1 — Domain: Plan, Subscription + GET /v1/plans, GET /v1/subscription
**Descrição**: expor planos disponíveis e uso atual do tenant.
**Objetivo**: implementar base de RF-08.
**Motivação**: toda validação de limite em outros épicos (nichos, contas sociais, agendas) depende deste contrato existir primeiro.
**Arquivos envolvidos**: `apps/api/src/domain/billing/entities/*.ts`, `PlanLimitsCalculator.ts`, controllers.
**Critérios de aceite**: conforme [api/subscriptions-api.md](../../api/subscriptions-api.md).
**Critérios de teste**: unitário do calculador; integração do endpoint.
**Checklist**: [ ] planos do seed condizem com limites documentados.
**Dependências**: EPIC-01.
**Labels**: `epic:EPIC-03`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-03.F1.S1.T2 — ChangePlanUseCase (upgrade/downgrade)
**Descrição**: troca de plano com validação de downgrade.
**Objetivo**: permitir crescimento/redução de assinatura sem quebrar dados existentes.
**Motivação**: downgrade sem validação poderia deixar tenant com mais nichos ativos que seu novo plano permite — inconsistência de negócio.
**Arquivos envolvidos**: `apps/api/src/application/use-cases/billing/ChangePlanUseCase.ts`.
**Critérios de aceite**: conforme [api/subscriptions-api.md](../../api/subscriptions-api.md) — `DOWNGRADE_BLOCKED_BY_USAGE`.
**Critérios de teste**: unitário (downgrade válido/inválido).
**Checklist**: [ ] upgrade nunca bloqueado por uso.
**Dependências**: ISSUE-03.F1.S1.T1.
**Labels**: `epic:EPIC-03`, `type:feature`, `layer:api`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-03.F2.S1.T1 — POST /v1/billing/checkout-session
**Descrição**: iniciar contratação/upgrade via Stripe Checkout.
**Objetivo**: permitir que o tenant pague pelo plano.
**Motivação**: monetização do produto depende deste fluxo — sem ele não há receita.
**Arquivos envolvidos**: `apps/api/src/infrastructure/adapters/stripe/StripeCheckoutAdapter.ts`.
**Critérios de aceite**: conforme [api/billing-api.md](../../api/billing-api.md).
**Critérios de teste**: integração com Stripe em modo teste; dublê se indisponível em CI.
**Checklist**: [ ] `STRIPE_SECRET_KEY` nunca logada.
**Dependências**: ISSUE-03.F1.S1.T1.
**Labels**: `epic:EPIC-03`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-03.F2.S1.T2 — Webhook Stripe
**Descrição**: sincronizar `Subscription.status` com eventos Stripe.
**Objetivo**: manter status de pagamento sempre correto sem intervenção manual.
**Motivação**: cobrança falha (`payment_failed`) precisa refletir no produto (bloqueio de novas gerações) automaticamente.
**Arquivos envolvidos**: `apps/api/src/interface/http/controllers/billing-webhook.controller.ts`.
**Critérios de aceite**: conforme [api/billing-api.md](../../api/billing-api.md) — assinatura inválida rejeitada com 400.
**Critérios de teste**: unitário (mapeamento evento → status); integração (payload assinado real de sandbox).
**Checklist**: [ ] evento duplicado não aplica efeito duas vezes.
**Dependências**: ISSUE-03.F2.S1.T1.
**Labels**: `epic:EPIC-03`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).
