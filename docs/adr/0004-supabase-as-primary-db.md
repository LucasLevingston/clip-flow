# ADR-0004 — Supabase (Postgres) como Banco Primário

## Status
Aceito

## Problema
O sistema precisa de um banco relacional confiável para dados fortemente estruturados e relacionados (tenants, assinaturas, nichos, vídeos, publicações), com baixo overhead operacional no MVP.

## Alternativas
1. **Supabase (Postgres gerenciado)** — Postgres real, auth opcional, storage de objetos, row-level security nativo.
2. **PlanetScale (MySQL/Vitess)** — serverless, mas sem suporte nativo a relações estritas (FKs) no plano padrão à época da decisão.
3. **RDS/Aurora (AWS)** — controle total, mas exige infraestrutura AWS própria.

## Escolha
**Supabase (Postgres)** como banco primário, acessado via Prisma como ORM/camada de acesso (ver [ADR](../database/er-model.md) para modelo completo).

## Consequências
- Postgres real permite modelagem relacional completa (FKs, constraints, índices compostos) — essencial para o domínio multi-tenant.
- Row-Level Security do Supabase é avaliado como camada defensiva adicional, mas **não substitui** autorização na aplicação (RBAC aplicado no domínio permanece a fonte de verdade — ver [security/authentication-authorization.md](../security/authentication-authorization.md)).
- Supabase Storage é usado para artefatos de vídeo (fonte e gerado) como alternativa gerenciada, evitando operar S3 próprio no MVP.
- Migrations gerenciadas via Prisma Migrate, versionadas no monorepo (ver [database/migrations.md](../database/migrations.md)).

## Trade-offs
- Dependência de um fornecedor gerenciado (vendor lock-in parcial); mitigado por Postgres ser padrão aberto — migração para RDS/Aurora no futuro é viável sem reescrever domínio.
- PlanetScale foi rejeitado por limitações de FK que conflitam com a necessidade de integridade referencial forte em um domínio financeiro/multi-tenant.
- RDS/Aurora foi rejeitado no MVP por contradizer a escolha de infraestrutura gerenciada de baixo overhead ([ADR-0007](0007-deploy-target-vercel-railway.md)).
