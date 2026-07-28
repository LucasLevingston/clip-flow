# Estratégia de Testes — Visão Geral

## Pirâmide de testes

```
        ▲
       /E2E\          — poucos, cobrem jornadas críticas ponta a ponta (Playwright)
      /------\
     /Integr. \       — moderados, cobrem Use Case + banco real/Testcontainers
    /----------\
   /   Unit     \     — muitos, cobrem domínio puro (entities, VOs, policies, services)
  /--------------\
```

## Cobertura mínima obrigatória

- Regras de negócio (domain + application layer): **> 90%** (RNF-27).
- Nenhuma classe testada é mockada dentro do próprio teste dela (só suas dependências).
- Cobertura de linha isolada nunca é objetivo por si só — cobertura é consequência de testar todo comportamento de negócio (nunca criar teste só para subir número).

## Ferramentas por camada

| Camada | Ferramenta |
|---|---|
| Frontend (`apps/web`) | Jest + React Testing Library + MSW |
| API/Workers (domínio e aplicação) | Jest (Node) |
| API/Workers (integração com banco) | Jest + Testcontainers (Postgres real efêmero) |
| E2E | Playwright, contra ambiente `staging` |

## Regra absoluta — sem dependência de rede real

- Frontend: toda chamada HTTP interceptada por MSW; nenhum teste depende de API real rodando.
- Backend: toda integração externa (YouTube, TikTok, Claude, OpenAI, Whisper, Stripe) é testada contra **dublês de teste** (fakes/mocks) que implementam a mesma interface de domínio (`AiCompletionProvider`, `TranscriptionProvider`, etc.) — nunca chamada real nessas suítes.
- Testes de integração usam Testcontainers para Postgres real (não SQLite/mocks de ORM), pois o comportamento de constraints/índices/RLS precisa ser verificado de verdade (ver [database/relationships-indexes.md](../database/relationships-indexes.md)).

## Documentos detalhados

| Documento | Conteúdo |
|---|---|
| [unit.md](unit.md) | Testes unitários — domínio, application services |
| [integration.md](integration.md) | Testes de integração — repositórios, isolamento multi-tenant, filas |
| [e2e.md](e2e.md) | Testes E2E — jornadas críticas |
| [fixtures-builders-factories.md](fixtures-builders-factories.md) | Infraestrutura de teste reutilizável |
| [coverage-pipeline.md](coverage-pipeline.md) | Metas de cobertura e integração com CI |
