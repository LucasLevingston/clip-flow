# Matriz de Riscos

Escala: **Probabilidade** (Baixa/Média/Alta) × **Impacto** (Baixo/Médio/Alto/Crítico). Prioridade de mitigação = combinação das duas.

## Riscos Técnicos

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-01 | Aquisição de conteúdo-fonte não escala (curadoria manual é gargalo — ver [ADR-0006](../adr/0006-content-source-strategy.md)) | Alta | Crítico | Monitorar taxa de esgotamento de pool por nicho (RF-16); priorizar automação de ingestão via parceiros licenciados assim que houver tração |
| R-02 | Custo de IA (Claude/OpenAI/Whisper) por vídeo maior que o previsto, inviabilizando margem | Média | Alto | Registro de custo por execução desde o dia 1 (RNF-21), alerta de limiar (RNF-22), cache de transcrição obrigatório |
| R-03 | Qualidade de reenquadramento (OpenCV) insuficiente sem revisão humana (Objetivo O2) | Média | Alto | `VideoQualityGate` como gate explícito; fila de moderação (FA3) como rede de segurança inicial |
| R-04 | Conteúdo duplicado entre canais do mesmo nicho gera penalização das plataformas (spam/conteúdo repetido) | Média | Alto | `HighlightDiversityPolicy` (ver [ADR-0006](../adr/0006-content-source-strategy.md)) + variação de copy por canal |
| R-05 | Processamento de vídeo (FFmpeg/OpenCV) é CPU-bound e pode não escalar linearmente com número de tenants | Média | Médio | Timeout e limite de concorrência por réplica (RNF-35); escalar por número de réplicas do Video Worker |

## Riscos das APIs (integrações externas)

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-06 | Aprovação do app TikTok para produção atrasa (fora de sandbox) | Média | Alto | Iniciar processo de aprovação na Sprint 0/1 (ver [roadmap/roadmap.md](../roadmap/roadmap.md)); lançar MVP com YouTube apenas se necessário |
| R-07 | Mudança de política/ToS das plataformas sociais quanto a conteúdo automatizado/republicado | Média | Crítico | Curadoria com licença explícita (ADR-0006) reduz exposição; monitorar comunicados oficiais das plataformas |
| R-08 | Rate limit/quota de YouTube/TikTok insuficiente para volume de publicação em growth | Baixa (MVP) / Média (growth) | Médio | `FA4` já trata reagendamento; solicitar aumento de quota junto às plataformas conforme volume cresce |
| R-09 | Mudança de contrato/preço da API do Claude ou OpenAI | Baixa | Médio | Estratégia dual de provedor (ADR-0008) já mitiga dependência única |

## Riscos de Deploy

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-10 | Migração destrutiva mal coordenada causa downtime | Baixa | Alto | Regra de migração aditiva + revisão obrigatória em migração destrutiva (ver [database/migrations.md](../database/migrations.md)) |
| R-11 | Limites de plano gerenciado (Railway/Render) insuficientes para picos de processamento de vídeo | Média | Médio | Monitorar uso de CPU/memória via observabilidade; plano de upgrade de tier documentado como runbook |

## Riscos de Performance

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-12 | Pipeline ultrapassa 15 min (RNF-02) em picos de concorrência | Média | Médio | Filas isoladas por domínio já paralelizam; adicionar réplicas do Video/AI Worker conforme volume |
| R-13 | Consulta de dashboard (agregações de analytics) degrada com crescimento de histórico | Baixa (MVP) | Médio | Índices dedicados já previstos ([database/relationships-indexes.md](../database/relationships-indexes.md)); avaliar view materializada em growth |

## Riscos de Segurança

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-14 | Vazamento de dado entre tenants por falha de filtro em repositório | Baixa | Crítico | Filtro de `tenantId` centralizado no repositório (não no chamador) + RLS como segunda camada + testes de integração dedicados (ver [testing/integration.md](../testing/integration.md)) |
| R-15 | Vazamento de tokens OAuth de contas sociais | Baixa | Crítico | Criptografia AES-256-GCM (ver [security/secrets-encryption.md](../security/secrets-encryption.md)), nunca logados |
| R-16 | Abuso de plano trial para gerar conteúdo em massa sem pagamento | Média | Baixo | Verificação de e-mail + limite de tenants por IP/dia (ver [security/rate-limiting-abuse.md](../security/rate-limiting-abuse.md)) |

## Legal / Compliance

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-17 | Uso de vídeo-fonte sem licença adequada gera notificação de infração/remoção (DMCA-like) | Baixa (dado o processo de curadoria) | Crítico | `LicenseInfo` obrigatório e auditável por `SourceVideo` (ADR-0006); processo de revisão administrativa antes de `APPROVED` |
| R-18 | Não conformidade LGPD em exclusão/portabilidade de dados | Baixa | Alto | Processo de soft delete + anonimização já modelado (ver [security/lgpd-compliance.md](../security/lgpd-compliance.md)) |

## Ranking de atenção imediata (Sprint 0/1)

1. **R-01** (curadoria de conteúdo) — é a maior dependência operacional do MVP inteiro.
2. **R-06** (aprovação TikTok) — tem lead time externo fora do controle da equipe; iniciar cedo.
3. **R-02** (custo de IA) — precisa de instrumentação desde o primeiro vídeo gerado, não depois.
4. **R-14** (isolamento multi-tenant) — risco de confiança do produto; testado desde a primeira migration.
