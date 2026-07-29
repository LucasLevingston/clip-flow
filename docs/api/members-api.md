# API — Gestão de Membros

## `POST /v1/members/invite`

**Objetivo**: convida um e-mail para se juntar ao tenant do chamador (RF-02).
**Entrada**:

```json
{ "email": "string", "role": "ADMIN|MEMBER" }
```

**Saída (201)**:

```json
{ "invitationId": "uuid", "email": "string", "role": "ADMIN|MEMBER", "expiresAt": "ISO date" }
```

**Validações**: Zod schema; `OWNER` não é um papel convidável — é atribuído uma única vez na criação do tenant (`TenantFactory`).
**Autorização**: JWT válido, papel `OWNER` ou `ADMIN` no tenant (RNF-06 — RBAC centralizado em `authMiddleware` + `requireRole`).
**Erros**: `MEMBERSHIP_ALREADY_EXISTS` (409 — e-mail já é membro do tenant), `VALIDATION_ERROR` (422), `UNAUTHORIZED` (401), `FORBIDDEN` (403).
**Observações**: reconvidar o mesmo e-mail atualiza o convite pendente existente (mesmo `id`) em vez de duplicá-lo; expira em 72h.

---

## `POST /v1/members/invitations/accept`

**Objetivo**: aceita um convite pendente, criando o `Membership` no tenant convidado.
**Entrada**:

```json
{ "tenantId": "uuid" }
```

**Saída (200)**:

```json
{ "tenantId": "uuid", "role": "ADMIN|MEMBER" }
```

**Validações**: o convite é casado por `(tenantId, e-mail do usuário autenticado)` — nunca por um token na URL. O e-mail vem do JWT verificado, nunca do corpo da requisição.
**Autorização**: JWT válido (qualquer papel — é uma ação sobre a própria conta).
**Erros**: `INVITATION_EXPIRED` (410 — convite inexistente, já aceito ou expirado), `MEMBERSHIP_ALREADY_EXISTS` (409), `VALIDATION_ERROR` (422), `UNAUTHORIZED` (401).
**Observações**: o `accessToken` da sessão atual não muda de tenant automaticamente — `LoginUseCase` sempre resolve o tenant mais antigo do usuário (ver simplificação documentada em `LoginUseCase.ts`); trocar de tenant ativo é escopo futuro.
