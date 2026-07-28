# Migrações

## Ferramenta
Prisma Migrate, versionado no monorepo em `packages/database/prisma/migrations/`, compartilhado entre `apps/api` e `apps/workers` (mesmo schema Prisma, um único client gerado — ver [ADR-0001](../adr/0001-monorepo-vs-polyrepo.md)).

## Regras obrigatórias

1. **Toda migração é aditiva por padrão.** Remoção de coluna/tabela exige duas etapas em PRs/deploys separados: (1) parar de escrever/ler o campo no código, (2) migração de remoção em um deploy subsequente — nunca no mesmo PR que introduz o campo como não usado.
2. **Nenhuma migração roda manualmente em produção.** Aplicada exclusivamente pelo pipeline de CI/CD, no passo de deploy (ver [cicd/pipeline.md](../cicd/pipeline.md)), após testes verdes.
3. **Toda migração destrutiva (`DROP COLUMN`, `DROP TABLE`, `ALTER COLUMN` que perde dado) exige aprovação explícita de um segundo revisor no PR**, sinalizado com label `migration:destructive`.
4. **Colunas `NOT NULL` novas em tabela existente com dados** exigem `DEFAULT` ou backfill controlado em migração própria antes de aplicar a constraint.
5. Toda migração é idempotente e reversível sempre que tecnicamente possível; quando não for (ex.: drop irreversível), isso é documentado no corpo do PR.

## Convenção de nomenclatura

```
<timestamp>_<verbo>_<entidade>[_<detalhe>]
20260115120000_create_tenant_and_membership
20260116093000_add_status_to_source_video
20260120101500_add_unique_schedule_run_id_to_generated_video
```

## Ordem de criação inicial (Sprint 0/1 — ver [roadmap](../roadmap/roadmap.md))

1. `user`, `tenant`, `membership`
2. `plan`, `subscription`
3. `niche`, `prompt_template`, `source_video`
4. `channel`
5. `social_account`, `channel_insights`
6. `generated_video`, `transcript`
7. `publish_record`
8. `analytics_snapshot`
9. `notification`, `notification_preference`

Essa ordem respeita as dependências de FK do [er-model.md](er-model.md) — nenhuma migração referencia uma tabela ainda não criada.

## Seed

Ambiente de `development`/`staging` recebe seed determinístico: 3 nichos de exemplo, 1 plano de cada tier, 2 vídeos-fonte de domínio público por nicho (com `LicenseInfo` de exemplo). `production` nunca roda seed automático — catálogo inicial é inserido via admin console (RF-15), auditado.
