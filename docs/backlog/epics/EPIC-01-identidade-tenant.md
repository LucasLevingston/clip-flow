# EPIC-01 — Identidade & Tenant

Cobre RF-01, RF-02.

## Feature EPIC-01.F1 — Cadastro e Autenticação

### História EPIC-01.F1.S1 — Registro e criação de tenant

**EPIC-01.F1.S1.T1 — Domain: Tenant, User, Membership + TenantFactory**
- Objetivo: implementar entidades e factory descritas em [domain/entities-value-objects.md](../../domain/entities-value-objects.md) e [domain/aggregates-repositories-factories.md](../../domain/aggregates-repositories-factories.md).
- Descrição: `Tenant`, `User`, `Membership` como entidades de domínio puras; `TenantFactory.create()` garante invariante "1 OWNER obrigatório".
- Arquivos: `apps/api/src/domain/identity/entities/*.ts`, `apps/api/src/domain/identity/factories/TenantFactory.ts`.
- Dependências: EPIC-00.F2.S1.T1.
- Critérios de aceite: `TenantFactory.create()` sempre retorna `Tenant` com exatamente 1 `Membership(OWNER)`.
- Testes obrigatórios: unitário — cria tenant válido; rejeita criação sem owner; `Membership` duplicado para mesmo usuário é rejeitado.
- Estimativa: 3 pontos.
- Checklist: [ ] sem dependência de Prisma no domínio [ ] 100% cobertura de invariantes.

**EPIC-01.F1.S1.T2 — RegisterTenantUseCase + `POST /v1/auth/register`**
- Objetivo: implementar RF-01 ponta a ponta.
- Descrição: Use Case orquestra `TenantFactory` + `UserRepository` + `TenantRepository` + `SubscriptionRepository` (cria `Subscription(TRIAL)`); controller HTTP com validação Zod.
- Arquivos: `apps/api/src/application/use-cases/identity/RegisterTenantUseCase.ts`, `apps/api/src/interface/http/controllers/auth.controller.ts`, `packages/shared-schemas/src/auth/registerSchema.ts`.
- Dependências: EPIC-01.F1.S1.T1.
- Critérios de aceite: conforme [api/auth-api.md](../../api/auth-api.md) — `POST /v1/auth/register`.
- Testes obrigatórios: unitário do Use Case (repositórios em memória); integração do endpoint com banco real (e-mail duplicado retorna 409).
- Estimativa: 5 pontos.
- Checklist: [ ] senha nunca retornada na resposta [ ] e-mail único validado no banco (constraint real, não só aplicação).

**EPIC-01.F1.S1.T3 — Login, refresh token e logout**
- Objetivo: implementar autenticação completa (ver [security/authentication-authorization.md](../../security/authentication-authorization.md)).
- Descrição: `LoginUseCase`, emissão de JWT (RS256) + refresh token rotativo em cookie httpOnly; endpoints `login`, `refresh`, `logout`, `me`.
- Arquivos: `apps/api/src/application/use-cases/identity/LoginUseCase.ts`, `apps/api/src/infrastructure/auth/JwtService.ts`, controllers correspondentes.
- Dependências: EPIC-01.F1.S1.T2.
- Critérios de aceite: conforme [api/auth-api.md](../../api/auth-api.md) — todos os endpoints de auth.
- Testes obrigatórios: unitário (geração/validação de token); integração (fluxo login → refresh → logout completo); teste de segurança (refresh token antigo invalidado após rotação).
- Estimativa: 8 pontos.
- Checklist: [ ] refresh token hasheado no banco [ ] cookie httpOnly/secure/samesite [ ] rate limit aplicado (ver [security/rate-limiting-abuse.md](../../security/rate-limiting-abuse.md)).

## Feature EPIC-01.F2 — Gestão de Organização

### História EPIC-01.F2.S1 — Convite e RBAC

**EPIC-01.F2.S1.T1 — Middleware de autenticação e RBAC (`requireRole`)**
- Objetivo: centralizar autorização (RNF-06).
- Descrição: middleware que resolve `userId`/`tenantId`/`role` do JWT e decorator `requireRole([...])`/`requirePlatformAdmin()`.
- Arquivos: `apps/api/src/interface/http/middlewares/auth.middleware.ts`, `rbac.middleware.ts`.
- Dependências: EPIC-01.F1.S1.T3.
- Critérios de aceite: rota protegida sem papel suficiente retorna 403; sem token retorna 401.
- Testes obrigatórios: unitário do middleware (casos: sem token, token inválido, papel insuficiente, papel suficiente).
- Estimativa: 3 pontos.
- Checklist: [ ] nenhuma rota checa papel manualmente fora do middleware.

**EPIC-01.F2.S1.T2 — InviteMemberUseCase + endpoints de gestão de membros**
- Objetivo: implementar RF-02.
- Descrição: convite por e-mail (expira 72h), aceite de convite, remoção de membro (bloqueando remoção do único OWNER).
- Arquivos: `apps/api/src/application/use-cases/identity/InviteMemberUseCase.ts`, controllers correspondentes.
- Dependências: EPIC-01.F2.S1.T1, [integrations/email.md](../../integrations/email.md) (dependência funcional, não bloqueante de implementação).
- Critérios de aceite: apenas OWNER/ADMIN convidam; não remove único OWNER; convite expira.
- Testes obrigatórios: unitário (invariante "não remove único owner"); integração (fluxo convite → aceite → membership criado).
- Estimativa: 5 pontos.
- Checklist: [ ] convite expirado é rejeitado [ ] e-mail de convite usa template versionado.
