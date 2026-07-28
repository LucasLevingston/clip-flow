# Auditoria, Soft Delete e Versionamento

## Soft Delete

Aplicado apenas às entidades onde exclusão física perderia rastreabilidade de negócio necessária:

| Tabela | Estratégia | Motivo |
|---|---|---|
| `tenant` | Soft delete (`deleted_at`) | Retenção para suporte/legal, mesmo após cancelamento |
| `user` | Soft delete (`deleted_at`) | E-mail permanece reservado (evita reuso indevido); dados pessoais anonimizados no soft delete (ver LGPD — [security/lgpd-compliance.md](../security/lgpd-compliance.md)) |
| `social_account` | Soft delete (`deleted_at`) | Histórico de publicações (`publish_record`) continua referenciando a conta mesmo desconectada |

**Todas as demais tabelas usam exclusão física ou, mais comumente, um campo `status` de ciclo de vida** (ex.: `Niche.status = INACTIVE`, `Channel.status = PAUSED`) em vez de soft delete — porque a maioria das entidades já modela "inativo" como estado de negócio válido (ver [domain/entities-value-objects.md](../domain/entities-value-objects.md)), tornando um segundo mecanismo de soft delete redundante.

Toda query de leitura em tabela com soft delete filtra `deleted_at IS NULL` por padrão na camada de repositório (nunca deixado a critério do chamador).

## Auditoria

| Evento auditado | Onde é registrado |
|---|---|
| Ações administrativas (RF-15): criar/editar nicho, aprovar/rejeitar `SourceVideo`, aprovar/rejeitar vídeo em moderação | Tabela `audit_log` dedicada |
| Mudanças de RBAC (convite, remoção, troca de papel) | `audit_log` |
| Mudanças de billing (troca de plano, cancelamento) | `audit_log` |
| Falhas de publicação e geração | Log estruturado (não `audit_log` — é operacional, não auditoria de negócio; ver [observability/observability.md](../observability/observability.md)) |

### Tabela `audit_log`

```
audit_log {
  id uuid PK
  actor_user_id uuid FK
  actor_type string        -- 'TENANT_USER' | 'PLATFORM_ADMIN' | 'SYSTEM'
  action string             -- ex: 'NICHE_CREATED', 'SOURCE_VIDEO_APPROVED', 'MEMBER_ROLE_CHANGED'
  target_type string        -- ex: 'Niche', 'SourceVideo', 'Membership'
  target_id uuid
  metadata jsonb
  created_at timestamp
}
```

`audit_log` é **append-only** — nenhuma linha é atualizada ou removida (imutabilidade — RNF-11). Retenção mínima: 2 anos.

## Versionamento

| Entidade | Estratégia de versão |
|---|---|
| `PromptTemplate` | Campo `version` incremental; nova versão não sobrescreve a anterior — permite auditar qual prompt gerou qual `GeneratedVideo` (rastreabilidade de IA) |
| `GeneratedVideo` | Não versionado — é ele mesmo um artefato point-in-time; correções geram um novo `GeneratedVideo`, nunca editam um já publicado |
| Schema do banco | Versionado via histórico de migrações Prisma (ver [migrations.md](migrations.md)) |
| Contratos de API | Versionamento por prefixo de rota (`/v1/...`) — ver [api/README.md](../api/README.md) |

`GeneratedVideo.highlight` e `GeneratedVideo.copy` armazenam, junto ao resultado, o `promptTemplateVersion` usado, para permitir auditoria e comparação de qualidade entre versões de prompt.
