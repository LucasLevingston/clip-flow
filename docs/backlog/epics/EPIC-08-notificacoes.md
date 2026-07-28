# EPIC-08 — Notificações

Cobre RF-12.

## Feature EPIC-08.F1 — Notification Worker

### História EPIC-08.F1.S1 — Envio in-app e e-mail

**EPIC-08.F1.S1.T1 — `EmailSender` (interface) + adapter do provedor escolhido**
- Objetivo: implementar envio de e-mail (ver [integrations/email.md](../../integrations/email.md)).
- Descrição: interface de domínio `EmailSender`; adapter concreto (Resend/SendGrid — decisão na Sprint 0) com templates versionados.
- Arquivos: `apps/workers/src/notification/domain/EmailSender.ts`, `apps/workers/src/notification/infrastructure/adapters/ResendEmailAdapter.ts`, `templates/*.tsx`.
- Dependências: EPIC-00.
- Critérios de aceite: falha de envio não impede criação da notificação in-app.
- Testes obrigatórios: unitário (dublê do provedor); integração (envio real em modo sandbox do provedor, se disponível).
- Estimativa: 5 pontos.
- Checklist: [ ] `EMAIL_PROVIDER_API_KEY` nunca logada.

**EPIC-08.F1.S1.T2 — `SendNotificationUseCase` consumindo todos os eventos do catálogo**
- Objetivo: implementar o worker terminal do pipeline de eventos (ver [architecture/event-flow.md](../../architecture/event-flow.md)).
- Descrição: um handler por evento consumido, respeitando `NotificationPreference`.
- Arquivos: `apps/workers/src/notification/application/use-cases/SendNotificationUseCase.ts`, `apps/workers/src/notification/main.ts`.
- Dependências: EPIC-08.F1.S1.T1, todos os épicos que emitem os eventos consumidos (06, 07, 04).
- Critérios de aceite: todos os 9 eventos do catálogo têm handler mapeado.
- Testes obrigatórios: unitário (1 teste por tipo de evento); integração (fila real, e-mail mockado).
- Estimativa: 8 pontos.
- Checklist: [ ] categoria default de preferência aplicada quando usuário não configurou.

## Feature EPIC-08.F2 — Preferências e Central de Notificações

### História EPIC-08.F2.S1 — API de notificações

**EPIC-08.F2.S1.T1 — `GET /v1/notifications`, `PATCH /v1/notifications/:id/read`**
- Objetivo: implementar central in-app.
- Descrição: listagem paginada, marcação de leitura.
- Arquivos: `apps/api/src/interface/http/controllers/notifications.controller.ts`.
- Dependências: EPIC-08.F1.
- Critérios de aceite: conforme [api/notifications-api.md](../../api/notifications-api.md).
- Testes obrigatórios: integração (escopo por usuário, não vaza notificação de outro usuário do mesmo tenant).
- Estimativa: 3 pontos.
- Checklist: [ ] índice `(tenant_id, user_id, read_at)` usado na query de contagem.

**EPIC-08.F2.S1.T2 — `GET/PUT /v1/notification-preferences`**
- Objetivo: permitir configurar categorias de e-mail.
- Descrição: CRUD simples de preferências por categoria.
- Arquivos: mesmo controller ou dedicado `notification-preferences.controller.ts`.
- Dependências: EPIC-08.F2.S1.T1.
- Critérios de aceite: conforme [api/notifications-api.md](../../api/notifications-api.md).
- Testes obrigatórios: integração (default aplicado corretamente quando não configurado).
- Estimativa: 2 pontos.
- Checklist: [ ] categoria inválida rejeitada (`INVALID_CATEGORY`).
