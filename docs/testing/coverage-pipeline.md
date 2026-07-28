# Cobertura e Pipeline

## Metas

| Camada | Meta de cobertura | Bloqueia merge se abaixo? |
|---|---|---|
| `domain/` (todas as apps) | ≥ 95% | Sim |
| `application/` (Use Cases) | ≥ 90% | Sim |
| `infrastructure/` (adapters) | ≥ 60% (foco em erro/edge case, não em rebater SDK de terceiro) | Não (apenas alerta) |
| `apps/web` componentes | ≥ 80% em componentes com lógica; componentes puramente visuais sem lógica não exigem teste dedicado além de smoke render | Sim para lógica; não para visual puro |

## Execução no CI

1. Lint (ESLint) + Prettier check.
2. Type check (`tsc --noEmit`) em todos os pacotes do monorepo (Turborepo cacheia por pacote não alterado).
3. Testes unitários (todos os pacotes, paralelo).
4. Testes de integração (Testcontainers — banco/Redis efêmeros por job de CI).
5. Relatório de cobertura consolidado (Turborepo agrega por pacote), publicado como artefato do PR.
6. E2E apenas no merge para `main` (ver [testing/e2e.md](e2e.md)).

## Regra de bloqueio

PR não pode ser mergeado se:
- Qualquer teste falhar.
- Cobertura de `domain/` ou `application/` cair abaixo da meta em relação ao baseline da branch `main` (verificação de cobertura incremental, não apenas absoluta — evita regressão mesmo em pacotes que já estão abaixo da meta histórica).
- Type check ou lint falhar.

Detalhe completo do pipeline de CI/CD (etapas de build/deploy além dos testes) em [cicd/pipeline.md](../cicd/pipeline.md).
