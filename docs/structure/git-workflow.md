# GitFlow — Fluxo de Trabalho Git

## Branches permanentes

| Branch | Propósito | Deploy |
|---|---|---|
| `main` | Código em produção | Deploy automático em `production` a cada merge (RNF-24) |
| `develop` | Integração contínua das features prontas | Deploy automático em `staging` |

## Branches temporárias

| Tipo | Origem | Destino | Uso |
|---|---|---|---|
| `feature/<epic>-<slug>` | `develop` | `develop` | Nova funcionalidade, referenciando a issue/task do backlog (ex.: `feature/EPIC-06-pipeline-geracao`) |
| `fix/<slug>` | `develop` | `develop` | Correção de bug não urgente |
| `release/<version>` | `develop` | `main` + `develop` | Estabilização antes de release (freeze de escopo, só bugfix) |
| `hotfix/<slug>` | `main` | `main` + `develop` | Correção urgente em produção |

## Regras obrigatórias

1. Nenhum push direto em `main` ou `develop` — sempre via Pull Request.
2. PR exige: CI verde (lint, type check, testes, cobertura — ver [testing/coverage-pipeline.md](../testing/coverage-pipeline.md)), ao menos 1 aprovação.
3. PR que altera contrato de API pública exige atualização do respectivo arquivo em `docs/api/`.
4. PR que introduz decisão estrutural nova exige ADR correspondente em `docs/adr/`.
5. Merge por **squash** em `feature/*`/`fix/*` → `develop` (histórico limpo, 1 commit por PR); merge por **merge commit** em `release/*`/`hotfix/*` → `main` (preserva rastreabilidade de release).
6. Toda branch referencia a Issue do backlog no nome ou na descrição do PR (ver [backlog/README.md](../backlog/README.md)).

## Checklist obrigatório antes de qualquer commit

- [ ] `pnpm type-check` sem erros em todos os pacotes afetados.
- [ ] `pnpm build` concluído sem erros.
- [ ] Todo arquivo alterado com lógica de negócio tem teste correspondente cobrindo o comportamento novo/alterado.
- [ ] `pnpm test` sem falhas.
- [ ] Documentação em `docs/` atualizada se o PR mudou contrato de API, schema de banco, ou decisão arquitetural.
- [ ] `README.md` do pacote/app afetado ainda reflete a realidade (setup, variáveis de ambiente, comandos).
