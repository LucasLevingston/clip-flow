# API — Autenticação

## `POST /v1/auth/register`
**Objetivo**: cria `User` + `Tenant` + `Membership(OWNER)` + `Subscription(TRIAL)` (RF-01).
**Entrada**:
```json
{ "email": "string", "password": "string (min 8, 1 número, 1 maiúscula)", "tenantName": "string" }
```
**Saída (201)**:
```json
{ "user": { "id": "uuid", "email": "string" }, "tenant": { "id": "uuid", "name": "string" }, "accessToken": "jwt", "refreshToken": "jwt (httpOnly cookie)" }
```
**Validações**: Zod schema; e-mail único; senha atende política.
**Autorização**: pública.
**Erros**: `EMAIL_ALREADY_EXISTS` (409), `VALIDATION_ERROR` (422).
**Exemplo**: `curl -X POST /v1/auth/register -d '{"email":"a@b.com","password":"Senha123","tenantName":"Minha Empresa"}'`

---

## `POST /v1/auth/login`
**Objetivo**: autentica usuário e emite tokens.
**Entrada**: `{ "email": "string", "password": "string" }`
**Saída (200)**: `{ "accessToken": "jwt (15min)", "refreshToken": "jwt httpOnly cookie (7 dias)" }`
**Validações**: Zod schema.
**Autorização**: pública.
**Erros**: `INVALID_CREDENTIALS` (401), `RATE_LIMITED` (429 — ver [security/rate-limiting-abuse.md](../security/rate-limiting-abuse.md)).

---

## `POST /v1/auth/refresh`
**Objetivo**: rotaciona access token a partir do refresh token válido.
**Entrada**: refresh token via cookie httpOnly (não no corpo).
**Saída (200)**: `{ "accessToken": "jwt" }`
**Validações**: assinatura e expiração do refresh token.
**Autorização**: refresh token válido.
**Erros**: `INVALID_REFRESH_TOKEN` (401), `REFRESH_TOKEN_EXPIRED` (401).

---

## `POST /v1/auth/logout`
**Objetivo**: revoga refresh token corrente.
**Entrada**: nenhuma (usa cookie).
**Saída (204)**: vazio.
**Autorização**: sessão válida.
**Erros**: nenhum específico (idempotente).

---

## `GET /v1/auth/me`
**Objetivo**: retorna usuário autenticado, tenant ativo e papel.
**Saída (200)**:
```json
{ "user": { "id": "uuid", "email": "string" }, "tenant": { "id": "uuid", "name": "string" }, "role": "OWNER|ADMIN|MEMBER" }
```
**Autorização**: JWT válido.
**Erros**: `UNAUTHORIZED` (401).
