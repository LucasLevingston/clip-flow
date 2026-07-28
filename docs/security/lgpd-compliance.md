# LGPD — Conformidade

## Dados pessoais tratados

| Dado | Titular | Base legal | Retenção |
|---|---|---|---|
| E-mail, nome | Usuário do tenant | Execução de contrato (prestação do serviço SaaS) | Enquanto conta ativa + período de retenção legal pós-cancelamento |
| Dados de pagamento | Usuário do tenant (Owner) | Execução de contrato | Processado pelo Stripe — Clip Flow não armazena número de cartão (PCI-DSS delegado ao Stripe) |
| Tokens de conta social conectada | Usuário do tenant | Execução de contrato (funcionalidade essencial do produto) | Enquanto conta social permanecer conectada |
| Logs de acesso/IP | Usuário do tenant | Legítimo interesse (segurança) | 90 dias |

## Direitos do titular suportados

| Direito | Implementação |
|---|---|
| Acesso aos dados | Endpoint de exportação de dados do usuário (self-service, roadmap fase 2; MVP atende via solicitação manual ao suporte) |
| Correção | Edição de perfil (nome/e-mail) via dashboard |
| Eliminação | Exclusão de conta aciona soft delete + anonimização de campos pessoais (`email` substituído por hash irreversível, `passwordHash` removido) — dados de negócio agregados/anônimos (ex.: métricas de vídeo) são preservados sem vínculo identificável |
| Portabilidade | Exportação de histórico de vídeos/métricas em CSV já suportada (RF-13) cobre parcialmente; extensão completa é item de roadmap |
| Revogação de consentimento | Desconexão de conta social (RF-05) revoga o token e é auditada |

## Regras de tratamento

- Nenhum dado pessoal é usado para treinar modelos de IA de terceiros além do necessário para a própria geração de conteúdo do tenant (transcrição/copy) — não há reuso de dado de um tenant para beneficiar outro além do compartilhamento já documentado e não-pessoal do `SourceVideo`/`Transcript` (que não contém dado pessoal do tenant, apenas do conteúdo-fonte licenciado).
- Dados de menores não são um caso de uso do produto (público-alvo é criador de conteúdo adulto/empresarial); cadastro exige confirmação de maioridade (checkbox) nos termos de uso.
- DPO (Encarregado de Dados) e canal de contato para exercício de direitos são definidos no processo legal/operacional da empresa, fora do escopo técnico desta documentação — referenciar em [FAQ.md](../FAQ.md) quando definido.

## Auditoria

Toda ação de exclusão/anonimização de dado pessoal é registrada em `audit_log` (ver [database/audit-soft-delete-versioning.md](../database/audit-soft-delete-versioning.md)) com `actor_type = 'SYSTEM'` ou `'TENANT_USER'`.
