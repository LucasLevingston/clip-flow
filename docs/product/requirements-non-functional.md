# Requisitos Não Funcionais (RNF)

Escala alvo declarada: **MVP/early-stage** — dezenas de tenants, centenas de vídeos/mês. Todos os números abaixo são calibrados para esse estágio, com folga explícita para growth (ver notas "Growth path").

## 1. Performance

| ID | Requisito | Alvo |
|---|---|---|
| RNF-01 | Tempo de resposta da API (p95, endpoints síncronos) | < 300ms |
| RNF-02 | Tempo total do pipeline (fonte → vídeo publicado) | < 15 min por vídeo |
| RNF-03 | Tempo de carregamento do dashboard (LCP) | < 2.5s |
| RNF-04 | Throughput mínimo do Video Worker | 1 vídeo/worker a cada 5 min |

**Growth path**: paralelizar Video Worker horizontalmente (fila BullMQ já suporta múltiplos consumidores); mover transcode para fila dedicada com prioridade se p95 do pipeline degradar.

## 2. Segurança

| ID | Requisito | Alvo |
|---|---|---|
| RNF-05 | Autenticação | JWT assinado (RS256) + refresh token rotativo |
| RNF-06 | Autorização | RBAC por tenant + papel de plataforma (`PLATFORM_ADMIN`) em todas as rotas |
| RNF-07 | Dados sensíveis em repouso | Tokens OAuth e secrets criptografados (AES-256-GCM) |
| RNF-08 | Transporte | TLS 1.2+ obrigatório em todas as comunicações externas |
| RNF-09 | Rate limiting | Por IP e por tenant em todas as rotas públicas de API |
| RNF-10 | Cabeçalhos de segurança | Helmet com CSP, HSTS, X-Frame-Options |
| RNF-11 | Auditoria | Ações administrativas e mudanças de billing/RBAC logadas de forma imutável |

Ver detalhamento em [security/](../security/).

## 3. Escalabilidade

| ID | Requisito | Alvo |
|---|---|---|
| RNF-12 | Workers stateless, escaláveis horizontalmente | Nenhum estado local persistente entre execuções |
| RNF-13 | Filas desacopladas por domínio | Fila própria por tipo de worker (video, ai, upload, analytics, notification) |
| RNF-14 | Banco suporta crescimento de tenants sem redesenho | Particionamento lógico por `tenant_id` desde o schema inicial |

**Growth path**: introduzir autoscaling de workers por profundidade de fila (Railway/Render suportam scaling por métrica); considerar sharding de fila por região se volume crescer.

## 4. Disponibilidade

| ID | Requisito | Alvo |
|---|---|---|
| RNF-15 | Uptime da API pública | 99.5% mensal (MVP) |
| RNF-16 | Degradação graciosa | Falha em integração externa (ex.: TikTok fora do ar) não derruba pipeline de outras plataformas |
| RNF-17 | Retomada após falha de worker | Jobs não confirmados (`ack`) retornam à fila automaticamente (BullMQ) |

## 5. Observabilidade

| ID | Requisito | Alvo |
|---|---|---|
| RNF-18 | Logs estruturados | JSON, correlação por `traceId`/`tenantId`/`jobId` |
| RNF-19 | Métricas de negócio e técnicas | Vídeos gerados/dia, taxa de falha por etapa, latência por worker |
| RNF-20 | Alertas | Fila acima de limiar, taxa de erro acima de limiar, integração externa fora do ar |

Ver [observability/observability.md](../observability/observability.md).

## 6. Custo

| ID | Requisito | Alvo |
|---|---|---|
| RNF-21 | Custo de IA por vídeo gerado | Monitorado por execução (tokens Claude/OpenAI + minutos Whisper) |
| RNF-22 | Alerta de custo | Alerta automático se custo médio/vídeo ultrapassar limiar configurado |
| RNF-23 | Infra gerenciada de baixo custo fixo | Vercel (frontend) + Railway/Render (workers/API) + Supabase (DB) — sem infraestrutura própria no MVP |

## 7. Deploy

| ID | Requisito | Alvo |
|---|---|---|
| RNF-24 | Deploy contínuo | Merge em `main` dispara deploy automático após pipeline verde |
| RNF-25 | Rollback | Rollback de um deploy em < 5 min (revert de deploy gerenciado) |
| RNF-26 | Ambientes isolados | `development`, `staging`, `production` com configs e credenciais separadas |

Ver [cicd/pipeline.md](../cicd/pipeline.md).

## 8. Manutenibilidade

| ID | Requisito | Alvo |
|---|---|---|
| RNF-27 | Cobertura de testes em regras de negócio | > 90% |
| RNF-28 | Complexidade ciclomática máxima por função | ≤ 10 |
| RNF-29 | Documentação viva | ADRs obrigatórios para toda decisão estrutural nova |

## 9. Testabilidade

| ID | Requisito | Alvo |
|---|---|---|
| RNF-30 | Toda regra de domínio testável sem I/O real | Repositórios e integrações externas atrás de interface, mockáveis |
| RNF-31 | Testes determinísticos | Sem dependência de tempo real não controlado (usar clock injetável) |

## 10. Resiliência

| ID | Requisito | Alvo |
|---|---|---|
| RNF-32 | Retry com backoff exponencial | Todas as chamadas a integrações externas (YouTube, TikTok, OpenAI, Claude) |
| RNF-33 | Circuit breaker | Integrações externas com falha recorrente são isoladas temporariamente |
| RNF-34 | Idempotência | Jobs de publicação idempotentes por `(generatedVideoId, socialAccountId)` — nunca publica duplicado |
| RNF-35 | Timeout explícito | Todo worker define timeout máximo por job, com dead-letter queue |
