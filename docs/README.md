# Clip Flow — Documentação

SaaS multi-tenant de automação de criação e publicação de vídeos curtos por nicho. Esta pasta é a **fonte única da verdade** para implementação — nenhuma funcionalidade deve ser construída sem lastro em um documento aqui (ver regra de finalização em [product/vision.md](product/vision.md)).

## Por onde começar

| Se você é... | Comece por |
|---|---|
| Novo no time, quer entender o produto | [product/vision.md](product/vision.md) |
| Vai implementar uma feature | [backlog/README.md](backlog/README.md) → Issue específica → docs referenciados por ela |
| Vai revisar arquitetura | [architecture/overview.md](architecture/overview.md) |
| Vai subir ambiente local | [DEVELOPMENT.md](DEVELOPMENT.md) |
| Vai fazer deploy | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Vai contribuir com código | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Mapa completo

| Pasta/Arquivo | Conteúdo |
|---|---|
| [product/](product/) | Visão, requisitos funcionais e não funcionais |
| [architecture/](architecture/) | C4, fluxos de eventos/workers/scheduler/IA/upload/analytics |
| [domain/](domain/) | Modelagem DDD — bounded contexts, entities, agregados, eventos, policies |
| [database/](database/) | Modelo ER, índices, migrações, auditoria |
| [api/](api/) | Contrato de todos os endpoints HTTP |
| [workers/](workers/) | Os 7 workers assíncronos |
| [integrations/](integrations/) | Todas as integrações externas |
| [security/](security/) | Autenticação, secrets, rate limit, LGPD |
| [testing/](testing/) | Estratégia de testes completa |
| [structure/](structure/) | Estrutura de pastas, convenções, GitFlow |
| [adr/](adr/) | Decisões arquiteturais registradas |
| [backlog/](backlog/) | Épicos, features, histórias, tasks e issues |
| [roadmap/](roadmap/roadmap.md) | Sprints até o MVP completo |
| [risks/](risks/risk-matrix.md) | Matriz de riscos e mitigação |
| [observability/](observability/observability.md) | Logs, métricas, alertas |
| [cicd/](cicd/pipeline.md) | Pipeline de CI/CD |

## Regra de governança da documentação

Toda mudança estrutural relevante (novo contrato de API, nova decisão arquitetural, nova entidade de domínio) **atualiza o documento correspondente no mesmo PR** que implementa a mudança — a documentação nunca fica defasada em relação ao código por mais de um PR (ver checklist em [structure/git-workflow.md](structure/git-workflow.md)).
