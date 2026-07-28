# Logs — Segurança

## Princípios

- Logs são estruturados (JSON), nunca texto livre, para permitir busca/correlação (RNF-18).
- Todo log carrega `traceId`, e quando aplicável `tenantId`, `userId`, `jobId` — nunca dado de negócio completo (ex.: nunca loga `GeneratedVideo.copy` inteiro, apenas seu `id`).
- Campos sensíveis são redigidos automaticamente por um serializer central (ver [security/secrets-encryption.md](secrets-encryption.md)) — nenhum worker/controller decide individualmente o que redigir.

## Níveis de log

| Nível | Uso |
|---|---|
| `error` | Falha que impede conclusão de uma operação de negócio (job falho definitivo, exceção não tratada) |
| `warn` | Situação anômala mas recuperável (retry acionado, fallback de IA acionado) |
| `info` | Eventos de negócio relevantes (vídeo publicado, tenant criado) |
| `debug` | Detalhe de execução, habilitado apenas em `development`/`staging` |

## Acesso a logs

- Logs de produção são acessíveis apenas a membros da equipe com papel operacional (não é dado de tenant exposto via produto).
- Nenhum log é acessível pelo tenant via UI/API — dashboard do tenant usa dados de domínio (RF-13), nunca logs brutos.

## Retenção

90 dias em armazenamento "quente" (busca rápida); logs de auditoria de negócio (`audit_log`, tabela de banco) seguem retenção de 2 anos, separada da retenção de log técnico (ver [database/audit-soft-delete-versioning.md](../database/audit-soft-delete-versioning.md)).

## Correlação ponta a ponta

`traceId` é gerado na entrada da API (ou no disparo do Scheduler Worker para jobs originados internamente) e propagado por todos os jobs subsequentes da cadeia do pipeline (ver [architecture/worker-flow.md](../architecture/worker-flow.md)), permitindo reconstruir o caminho completo de um `GeneratedVideo` da origem à publicação em uma única busca de log.
