# Integração — Supabase

## Propósito
Banco de dados primário (Postgres) e Object Storage para vídeos-fonte e vídeos gerados (ver [ADR-0004](../adr/0004-supabase-as-primary-db.md)).

## Componentes usados
- **Postgres gerenciado**: acessado via Prisma (não via SDK REST do Supabase, para manter controle total de schema/migrations — ver [database/migrations.md](../database/migrations.md)).
- **Storage**: buckets `source-videos` (privado, somente leitura por workers) e `generated-videos` (privado, URLs assinadas com expiração para entrega e para as plataformas sociais).
- **Row-Level Security (RLS)**: camada defensiva adicional por `tenant_id` nas tabelas com escopo de tenant — não substitui autorização da aplicação.

## Uso no pipeline
- API HTTP e todos os workers compartilham a mesma connection string via variável de ambiente por serviço (nunca hardcoded).
- Video Worker lê `source-videos` e escreve em `generated-videos`.

## Erros tratados
| Erro | Tratamento |
|---|---|
| Timeout de conexão | Retry de conexão (pool do Prisma) |
| Falha de upload ao Storage | Retry padrão do worker chamador |

## Segredos necessários
`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (apenas para Storage; nunca exposta ao frontend), `SUPABASE_STORAGE_BUCKET_SOURCE`, `SUPABASE_STORAGE_BUCKET_GENERATED`.
