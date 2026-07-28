# Issues — EPIC-01 Identidade & Tenant

---

### ISSUE-01.F1.S1.T1 — Domain: Tenant, User, Membership + TenantFactory
**Descrição**: implementar entidades de identidade e factory de criação de tenant.
**Objetivo**: garantir que todo `Tenant` nasce com exatamente 1 `Membership(OWNER)`.
**Motivação**: essa invariante é a base de todo o RBAC do produto — se quebrada, um tenant pode ficar "órfão" sem dono.
**Arquivos envolvidos**: `apps/api/src/domain/identity/entities/*.ts`, `apps/api/src/domain/identity/factories/TenantFactory.ts`.
**Critérios de aceite**: `TenantFactory.create()` sempre retorna tenant com 1 owner.
**Critérios de teste**: unitário — cria válido; rejeita sem owner; rejeita membership duplicado.
**Checklist**: [ ] sem dependência de Prisma no domínio [ ] 100% cobertura de invariantes.
**Dependências**: ISSUE-00.F2.S1.T1.
**Labels**: `epic:EPIC-01`, `type:feature`, `layer:domain`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-01.F1.S1.T2 — RegisterTenantUseCase + `POST /v1/auth/register`
**Descrição**: implementar RF-01 ponta a ponta.
**Objetivo**: permitir que um visitante crie conta e organização em uma única ação.
**Motivação**: é o primeiro passo de toda jornada do produto (UC01) — bloqueia todos os demais épicos de tenant.
**Arquivos envolvidos**: `apps/api/src/application/use-cases/identity/RegisterTenantUseCase.ts`, `apps/api/src/interface/http/controllers/auth.controller.ts`, `packages/shared-schemas/src/auth/registerSchema.ts`.
**Critérios de aceite**: conforme [api/auth-api.md](../../api/auth-api.md).
**Critérios de teste**: unitário (repositórios em memória); integração (e-mail duplicado → 409).
**Checklist**: [ ] senha nunca retornada [ ] e-mail único por constraint real.
**Dependências**: ISSUE-01.F1.S1.T1.
**Labels**: `epic:EPIC-01`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-01.F1.S1.T3 — Login, refresh token e logout
**Descrição**: implementar autenticação completa com rotação de refresh token.
**Objetivo**: sessão segura e persistente para o usuário.
**Motivação**: sem isso, nenhuma rota protegida do restante do produto pode ser testada de ponta a ponta.
**Arquivos envolvidos**: `apps/api/src/application/use-cases/identity/LoginUseCase.ts`, `apps/api/src/infrastructure/auth/JwtService.ts`, controllers.
**Critérios de aceite**: conforme [api/auth-api.md](../../api/auth-api.md).
**Critérios de teste**: unitário (geração/validação de token); integração (login → refresh → logout); segurança (refresh antigo invalidado).
**Checklist**: [ ] refresh hasheado no banco [ ] cookie httpOnly/secure/samesite [ ] rate limit aplicado.
**Dependências**: ISSUE-01.F1.S1.T2.
**Labels**: `epic:EPIC-01`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-01.F2.S1.T1 — Middleware de autenticação e RBAC
**Descrição**: centralizar autorização em middleware único.
**Objetivo**: garantir que nenhuma rota fica protegida "por esquecimento" de checagem manual.
**Motivação**: RNF-06 exige RBAC em toda rota; centralizar é a única forma de garantir isso de forma auditável.
**Arquivos envolvidos**: `apps/api/src/interface/http/middlewares/auth.middleware.ts`, `rbac.middleware.ts`.
**Critérios de aceite**: sem papel suficiente → 403; sem token → 401.
**Critérios de teste**: unitário (sem token, token inválido, papel insuficiente, papel suficiente).
**Checklist**: [ ] nenhuma rota checa papel manualmente fora do middleware.
**Dependências**: ISSUE-01.F1.S1.T3.
**Labels**: `epic:EPIC-01`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-01.F2.S1.T2 — InviteMemberUseCase + endpoints de gestão de membros
**Descrição**: convite, aceite e remoção de membros do tenant.
**Objetivo**: implementar RF-02 (colaboração básica dentro do tenant).
**Motivação**: agências (persona "Estúdio Nova") precisam de múltiplos usuários operando o mesmo tenant.
**Arquivos envolvidos**: `apps/api/src/application/use-cases/identity/InviteMemberUseCase.ts`, controllers.
**Critérios de aceite**: apenas OWNER/ADMIN convidam; não remove único OWNER; convite expira em 72h.
**Critérios de teste**: unitário (invariante "não remove único owner"); integração (convite → aceite → membership).
**Checklist**: [ ] convite expirado rejeitado [ ] e-mail de convite usa template versionado.
**Dependências**: ISSUE-01.F2.S1.T1.
**Labels**: `epic:EPIC-01`, `type:feature`, `layer:api`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).
