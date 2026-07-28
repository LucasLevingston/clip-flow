# Issues — EPIC-08 Notificações

---

### ISSUE-08.F1.S1.T1 — EmailSender + adapter do provedor
**Descrição**: interface de domínio e adapter concreto de e-mail transacional.
**Objetivo**: habilitar envio de e-mail desacoplado de provedor.
**Motivação**: DIP aplicado aqui permite trocar Resend/SendGrid sem tocar no Notification Worker.
**Arquivos envolvidos**: `apps/workers/src/notification/domain/EmailSender.ts`, `apps/workers/src/notification/infrastructure/adapters/ResendEmailAdapter.ts`, templates.
**Critérios de aceite**: falha de envio não impede notificação in-app.
**Critérios de teste**: unitário (dublê); integração (sandbox do provedor).
**Checklist**: [ ] `EMAIL_PROVIDER_API_KEY` nunca logada.
**Dependências**: EPIC-00.
**Labels**: `epic:EPIC-08`, `type:feature`, `layer:worker`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-08.F1.S1.T2 — SendNotificationUseCase (todos os eventos)
**Descrição**: worker terminal consumindo todo o catálogo de eventos.
**Objetivo**: implementar RF-12 por completo.
**Motivação**: usuário precisa saber o que está acontecendo com seus vídeos sem precisar checar o dashboard manualmente todo dia.
**Arquivos envolvidos**: `apps/workers/src/notification/application/use-cases/SendNotificationUseCase.ts`, `main.ts`.
**Critérios de aceite**: todos os 9 eventos do catálogo têm handler mapeado.
**Critérios de teste**: unitário (1 por tipo de evento); integração (fila real, e-mail mockado).
**Checklist**: [ ] categoria default aplicada quando usuário não configurou.
**Dependências**: ISSUE-08.F1.S1.T1, EPIC-04, EPIC-06, EPIC-07.
**Labels**: `epic:EPIC-08`, `type:feature`, `layer:worker`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-08.F2.S1.T1 — Central de notificações in-app
**Descrição**: listagem e marcação de leitura.
**Objetivo**: dar visibilidade in-app das notificações geradas.
**Motivação**: nem todo usuário quer e-mail para tudo — central in-app é o canal primário.
**Arquivos envolvidos**: `apps/api/src/interface/http/controllers/notifications.controller.ts`.
**Critérios de aceite**: conforme [api/notifications-api.md](../../api/notifications-api.md).
**Critérios de teste**: integração (escopo por usuário).
**Checklist**: [ ] índice `(tenant_id, user_id, read_at)` usado.
**Dependências**: ISSUE-08.F1.S1.T2.
**Labels**: `epic:EPIC-08`, `type:feature`, `layer:api`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-08.F2.S1.T2 — Preferências de notificação
**Descrição**: CRUD de preferências por categoria.
**Objetivo**: dar controle ao usuário sobre volume de e-mail recebido.
**Motivação**: excesso de e-mail transacional é motivo comum de cancelamento/descrédito do produto.
**Arquivos envolvidos**: `notification-preferences.controller.ts`.
**Critérios de aceite**: conforme [api/notifications-api.md](../../api/notifications-api.md).
**Critérios de teste**: integração (default aplicado quando não configurado).
**Checklist**: [ ] categoria inválida rejeitada.
**Dependências**: ISSUE-08.F2.S1.T1.
**Labels**: `epic:EPIC-08`, `type:feature`, `layer:api`, `priority:P2`.
**Prioridade**: P2. **Complexidade**: Baixa. **Tempo estimado**: 1 dia (2 pontos).
