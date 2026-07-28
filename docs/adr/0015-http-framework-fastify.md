# ADR-0015 — API HTTP Framework: Fastify

## Status

Aceito.

## Problema

[architecture/c4-container.md](../architecture/c4-container.md) descreve `apps/api` como "Node.js / Express-Fastify + TypeScript" sem fixar qual dos dois. É preciso decidir antes de escrever o primeiro endpoint (Sprint 1, EPIC-01).

## Alternativas

1. **Express** — ecossistema maior, porém sem validação de schema nativa, tipagem fraca por padrão, desempenho inferior.
2. **Fastify** — schema-based validation nativa (compatível com JSON Schema; usável junto com Zod via `fastify-type-provider-zod`), tipagem TypeScript de primeira classe, plugin system explícito (encapsulamento por padrão), melhor throughput.

## Escolha

**Fastify**, com `@fastify/type-provider-zod` para que os schemas Zod exigidos em toda fronteira de API (ver regras inegociáveis da stack) sirvam tanto para validação em runtime quanto para inferência de tipo no handler — sem duplicar contrato entre Zod e um schema HTTP separado.

## Consequências

- Toda rota declara `schema: { body, querystring, params, response }` com schemas Zod, entregando validação (RF de todos os endpoints — ver [api/](../api/)) e tipos sem duplicação.
- Plugins Fastify (encapsulamento) mapeiam naturalmente para `interface/http/routes/<domínio>.ts` por bounded context.
- Fastify's `onRequest`/`preHandler` hooks implementam os middlewares de auth/RBAC/rate-limit (ver [security/authentication-authorization.md](../security/authentication-authorization.md)) sem framework adicional.

## Trade-offs

- Ecossistema de middlewares de terceiros é menor que o do Express — mitigado por Fastify cobrir nativamente (ou via plugins oficiais `@fastify/*`) tudo que a stack já exige (CORS, Helmet-equivalente via `@fastify/helmet`, rate limit via `@fastify/rate-limit`, cookies).
