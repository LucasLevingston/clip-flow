# Contribuindo

## Pré-requisito
Leia [product/vision.md](product/vision.md) e [architecture/overview.md](architecture/overview.md) antes de abrir seu primeiro PR — toda decisão de implementação parte desse contexto.

## Fluxo de trabalho
1. Escolha uma Issue em [backlog/issues/](backlog/issues/) (ou crie uma nova seguindo o mesmo padrão de campos, ver [backlog/README.md](backlog/README.md)).
2. Crie a branch conforme [structure/git-workflow.md](structure/git-workflow.md) (`feature/<epic>-<slug>`).
3. Implemente seguindo:
   - [structure/conventions.md](structure/conventions.md) (naming, imports, aliases).
   - [structure/folder-structure.md](structure/folder-structure.md) (onde cada arquivo vive).
   - Princípios SOLID/Clean Architecture aplicados por camada (ver [domain/](domain/) para a separação domain/application/infrastructure).
4. Escreva testes **junto com o código**, nunca depois (TDD é obrigatório — ver [testing/strategy.md](testing/strategy.md)).
5. Rode o checklist pré-commit (ver [structure/git-workflow.md](structure/git-workflow.md#checklist-obrigatório-antes-de-qualquer-commit)).
6. Abra PR para `develop`, referenciando a Issue.
7. Aguarde CI verde + 1 aprovação.

## O que todo PR precisa

- [ ] Código + testes cobrindo o comportamento (nunca só um dos dois).
- [ ] Documentação em `docs/` atualizada se o PR mudou contrato de API, schema, decisão arquitetural ou convenção.
- [ ] Nenhuma regra de negócio duplicada — se você notou lógica repetida, extraia (ver [structure/conventions.md](structure/conventions.md)).
- [ ] Nenhum `any`, nenhuma promise sem tratamento (lint bloqueia, mas revise antes de depender só disso).

## Quando abrir um ADR

Sempre que sua mudança introduzir uma nova dependência de infraestrutura, mudar um padrão arquitetural estabelecido, ou trocar um provedor crítico — antes de implementar, não depois (ver [adr/README.md](adr/README.md)).

## Dúvidas de arquitetura

Se sua tarefa não se encaixa claramente em nenhum bounded context existente ([domain/bounded-contexts.md](domain/bounded-contexts.md)), pare e discuta com o time antes de criar um novo — a fronteira errada é cara de corrigir depois.
