# ADR-0005 — Estratégia Multi-Tenant

## Status
Aceito

## Problema
Clip Flow é SaaS multi-tenant desde o dia 1 (confirmado pelo Product Owner). É preciso escolher como isolar dados entre tenants no banco compartilhado.

## Alternativas
1. **Schema único compartilhado + coluna `tenant_id`** em todas as tabelas com escopo de tenant, aplicando filtro obrigatório na camada de repositório.
2. **Schema por tenant** (schema Postgres dedicado por tenant).
3. **Banco por tenant** (isolamento físico total).

## Escolha
**Schema único compartilhado + `tenant_id`**, com filtro de tenant obrigatório e centralizado na camada de repositório (nunca deixado a critério de cada query manual), reforçado por Row-Level Security no Postgres como segunda camada defensiva.

## Consequências
- Toda tabela com escopo de tenant tem `tenant_id NOT NULL` com índice composto `(tenant_id, ...)` nas queries mais frequentes.
- Repositórios de domínio recebem o `tenant_id` do contexto de autenticação e o aplicam automaticamente — nenhum Use Case/Service monta filtro de tenant manualmente (evita vazamento de dado entre tenants por esquecimento).
- Escala bem para dezenas/centenas de tenants sem overhead operacional de múltiplos schemas/bancos (adequado à escala MVP declarada).
- Entidades globais (`Niche`, `SourceVideo`, `Plan`) não têm `tenant_id` — são compartilhadas por design (ver [domain/bounded-contexts.md](../domain/bounded-contexts.md)).

## Trade-offs
- Isolamento é lógico, não físico — um bug de filtro é um risco real de vazamento entre tenants; mitigado por RLS no Postgres como rede de segurança e testes de integração dedicados a isolamento (ver [testing/integration.md](../testing/integration.md)).
- Schema-por-tenant (alternativa 2) foi rejeitado por complexidade de migração (rodar N migrations por deploy) desproporcional à escala MVP.
- Banco-por-tenant (alternativa 3) foi rejeitado por custo e overhead operacional incompatíveis com um SaaS de entrada em early-stage.
