# API — Notificações

## `GET /v1/notifications`
**Objetivo**: lista notificações in-app do usuário autenticado (RF-12).
**Entrada**: query `?page=&pageSize=&unreadOnly=true`
**Saída (200)**: lista paginada de `{ id, category, payload, readAt, createdAt }`
**Autorização**: JWT válido (escopo por `user_id` + `tenant_id`).
**Erros**: `UNAUTHORIZED` (401).

---

## `PATCH /v1/notifications/:id/read`
**Objetivo**: marca notificação como lida.
**Saída (200)**: `Notification` atualizado.
**Autorização**: JWT válido; notificação pertence ao usuário.
**Erros**: `NOTIFICATION_NOT_FOUND` (404).

---

## `GET /v1/notification-preferences`
**Objetivo**: retorna preferências de e-mail por categoria.
**Saída (200)**: lista de `{ category, emailEnabled }`
**Autorização**: JWT válido.
**Erros**: `UNAUTHORIZED` (401).

---

## `PUT /v1/notification-preferences`
**Objetivo**: atualiza preferências de e-mail por categoria.
**Entrada**: lista de `{ category, emailEnabled }`
**Saída (200)**: preferências atualizadas.
**Autorização**: JWT válido.
**Erros**: `INVALID_CATEGORY` (422).
