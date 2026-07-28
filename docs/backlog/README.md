# Backlog — Índice de Épicos

Hierarquia: **Épico** → **Feature** → **História** → **Task**. Cada Task tem uma Issue individual correspondente em [backlog/issues/](issues/) (mesmo ID, prefixo `ISSUE-`).

## Épicos (ordem de dependência, não necessariamente ordem de sprint — ver [roadmap/roadmap.md](../roadmap/roadmap.md))

| Épico | Nome | Requisitos cobertos | Depende de |
|---|---|---|---|
| [EPIC-00](epics/EPIC-00-fundacao-tecnica.md) | Fundação Técnica e Infraestrutura | — (habilita todos os demais) | — |
| [EPIC-01](epics/EPIC-01-identidade-tenant.md) | Identidade & Tenant | RF-01, RF-02 | EPIC-00 |
| [EPIC-02](epics/EPIC-02-catalogo-nicho.md) | Catálogo & Canais | RF-03, RF-04 | EPIC-00, EPIC-01, EPIC-03 |
| [EPIC-03](epics/EPIC-03-billing-planos.md) | Billing & Planos | RF-08 | EPIC-01 |
| [EPIC-04](epics/EPIC-04-contas-sociais.md) | Contas Sociais do Canal | RF-05 | EPIC-02 |
| [EPIC-05](epics/EPIC-05-agendamento.md) | Configuração de Publicação do Canal | RF-06, RF-14 | EPIC-02, EPIC-04 |
| [EPIC-06](epics/EPIC-06-pipeline-geracao.md) | Pipeline de Geração | RF-07, RF-09, RF-11 | EPIC-02, EPIC-05 |
| [EPIC-07](epics/EPIC-07-publicacao.md) | Publicação | RF-10 | EPIC-06 |
| [EPIC-08](epics/EPIC-08-notificacoes.md) | Notificações | RF-12 | EPIC-06, EPIC-07 |
| [EPIC-09](epics/EPIC-09-dashboard-analytics.md) | Dashboard, Analytics & Aprendizado | RF-13, RF-17 | EPIC-07 |
| [EPIC-10](epics/EPIC-10-administracao.md) | Administração da Plataforma | RF-15, RF-16 | EPIC-02, EPIC-06 |

## Convenção de ID

- Épico: `EPIC-XX`
- Feature: `EPIC-XX.F<n>`
- História: `EPIC-XX.F<n>.S<n>`
- Task/Issue: `EPIC-XX.F<n>.S<n>.T<n>`

Exemplo: `EPIC-06.F3.S1.T2` = Épico 06, Feature 3, História 1, Task 2.

## Padrão de Task (aplicado em todo backlog)

Toda Task documenta: **Objetivo · Descrição · Arquivos · Dependências · Critérios de aceite · Testes obrigatórios · Estimativa · Checklist**.

## Padrão de Issue (aplicado em [backlog/issues/](issues/))

Toda Issue documenta: **Título · Descrição · Objetivo · Motivação · Arquivos envolvidos · Critérios de aceite · Critérios de teste · Checklist · Dependências · Labels · Prioridade · Complexidade · Tempo estimado**. Issues são a mesma unidade de trabalho que a Task correspondente, reformatada para importação direta em um tracker (GitHub Issues/Linear).

## Labels padronizadas

`epic:EPIC-XX` · `type:feature` / `type:bug` / `type:chore` / `type:docs` · `layer:domain` / `layer:api` / `layer:worker` / `layer:frontend` / `layer:infra` · `priority:P0` / `priority:P1` / `priority:P2`
