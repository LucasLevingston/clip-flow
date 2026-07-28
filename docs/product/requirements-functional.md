# Requisitos Funcionais

Convenção de ID: `RF-XX`. Prioridade: **P0** (bloqueia MVP) · **P1** (importante, pode seguir logo após MVP) · **P2** (desejável).

---

### RF-01 — Cadastro e autenticação de usuário
**Descrição**: o sistema deve permitir cadastro via e-mail/senha e login com emissão de JWT + refresh token. Ao cadastrar, um tenant (organização) é criado automaticamente com o usuário como `Owner`.
**Critérios de aceite**:
- Cadastro exige e-mail único, senha com política mínima (8+ caracteres, 1 número, 1 maiúscula).
- Login retorna access token (JWT, 15min) e refresh token (httpOnly cookie, 7 dias).
- Tenant é criado com plano `TRIAL` por padrão.
**Prioridade**: P0. **Dependências**: nenhuma.

### RF-02 — Gestão de organização (tenant)
**Descrição**: o Owner pode editar dados da organização e convidar/remover membros com papéis (`OWNER`, `ADMIN`, `MEMBER`).
**Critérios de aceite**:
- Apenas `OWNER`/`ADMIN` convidam membros.
- Convite expira em 72h.
- Não é possível remover o único `OWNER`.
**Prioridade**: P1. **Dependências**: RF-01.

### RF-03 — Catálogo de nichos
**Descrição**: o sistema expõe um catálogo de nichos pré-cadastrados pela administração, com nome, descrição, categoria e exemplo de estilo visual.
**Critérios de aceite**:
- Nichos são somente leitura para tenants (não podem criar/editar).
- Nicho tem status `ACTIVE`/`INACTIVE`; apenas `ACTIVE` aparece para assinatura.
- Cadastro de novo nicho é feito por área administrativa (fora do app do tenant).
**Prioridade**: P0. **Dependências**: nenhuma.

### RF-04 — Criação e configuração de Canal
**Descrição**: tenant cria um Canal escolhendo nicho, nome, idioma, quantidade de vídeos/dia, horários de publicação e plataformas-alvo (YouTube, TikTok ou ambos), respeitando o limite de canais do plano (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)).
**Critérios de aceite**:
- Bloqueia criação de canal acima do limite do plano, com mensagem de upgrade.
- Um tenant pode ter múltiplos canais, inclusive mais de um para o mesmo nicho.
- Tenant pode pausar (não remove histórico) e retomar um canal (RF-14).
- Nicho do canal é imutável após criação (trocar nicho exige criar novo canal).
**Prioridade**: P0. **Dependências**: RF-03, RF-08.

### RF-05 — Conexão de conta social ao Canal (OAuth)
**Descrição**: tenant conecta, no contexto de um canal específico, até uma conta do YouTube e uma do TikTok via fluxo OAuth2, com armazenamento seguro dos tokens.
**Critérios de aceite**:
- No máximo 1 conta por plataforma por canal.
- Token de acesso/refresh armazenado criptografado (ver [security/secrets-encryption.md](../security/secrets-encryption.md)); renovação de access token é automática via refresh token, sem ação do usuário.
- Conta com refresh token inválido/revogado é marcada `NEEDS_REAUTH` e bloqueia publicações naquela conta (FA2).
- Canal com `platforms = BOTH` só fica elegível para geração/publicação quando as duas contas estiverem `CONNECTED`.
**Prioridade**: P0. **Dependências**: RF-04.

### RF-06 — Configuração de geração e publicação do Canal
**Descrição**: como parte da configuração do canal (RF-04), tenant define quantidade de vídeos/dia (1–10), horário de geração em lote (padrão 06:00) e lista de horários estratégicos de publicação — ver [ADR-0012](../adr/0012-batch-generation-delayed-publish.md).
**Critérios de aceite**:
- Quantidade de vídeos/dia validada contra limite do plano.
- Se o usuário não customizar horários de publicação, o sistema distribui automaticamente ao longo de uma janela padrão (ex.: 09h–20h).
- Fuso horário do tenant é respeitado em todos os horários.
- Alterações valem a partir do próximo ciclo (não interrompe lote em andamento).
**Prioridade**: P0. **Dependências**: RF-04.

### RF-07 — Curadoria de conteúdo-fonte (admin)
**Descrição**: administração ingere vídeos-fonte licenciados/autorizados por nicho, com metadados (duração, idioma, direitos de uso).
**Critérios de aceite**:
- Vídeo-fonte fica em estado `PENDING_REVIEW` até aprovação administrativa.
- Somente vídeos `APPROVED` entram no pool de seleção do pipeline.
- Cada vídeo-fonte registra explicitamente a base legal/licença de uso.
**Prioridade**: P0. **Dependências**: RF-03.

### RF-08 — Planos e limites (billing)
**Descrição**: sistema define planos SaaS (ex.: `TRIAL`, `STARTER`, `PRO`, `AGENCY`) com limites de canais simultâneos e vídeos/dia por canal.
**Critérios de aceite**:
- Mudança de plano recalcula limites imediatamente.
- Downgrade que viola limite atual (ex.: mais canais ativos que o novo plano permite) exige que o usuário desative excedentes antes de confirmar.
- Cobrança recorrente via gateway de pagamento (Stripe — ver [ADR](../adr/README.md)).
**Prioridade**: P0. **Dependências**: nenhuma.

### RF-09 — Geração em lote diária de vídeos
**Descrição**: no horário de geração configurado do canal, o sistema gera de uma vez todos os N vídeos do dia: seleciona vídeos-fonte não utilizados pelo canal, transcreve, seleciona o melhor trecho via IA (melhores momentos, emoção, retenção, potencial viral), corta, reformata para 9:16, gera legenda, título/descrição/hashtags/CTA, e thumbnail opcional (ver [ADR-0012](../adr/0012-batch-generation-delayed-publish.md), [ADR-0013](../adr/0013-thumbnail-frame-extraction.md)).
**Critérios de aceite**:
- Transcrição é cacheada por vídeo-fonte (reutilizável entre canais e tenants).
- Seleção de trecho e copy variam entre canais que usam o mesmo vídeo-fonte, para evitar conteúdo idêntico (ver [ADR-0006](../adr/0006-content-source-strategy.md)).
- Quando houver `ChannelInsights` disponível para o canal, a geração usa esses insights como contexto adicional (ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)).
- Cada vídeo gerado já nasce associado a um horário-alvo de publicação (um dos horários estratégicos do canal).
- Vídeo final respeita especificações de plataforma (proporção, duração, formato) — ver [integrations/youtube.md](../integrations/youtube.md) e [integrations/tiktok.md](../integrations/tiktok.md).
- Falha em um vídeo do lote marca apenas aquele `GeneratedVideo` como `FAILED`, sem interromper os demais do mesmo lote.
**Prioridade**: P0. **Dependências**: RF-04, RF-05, RF-06, RF-07.

### RF-10 — Publicação em horários estratégicos, com espelhamento
**Descrição**: sistema publica cada `GeneratedVideo` do lote no seu horário-alvo, nas plataformas ativas do canal — quando o canal está configurado como "Ambos", o mesmo vídeo é publicado (espelhado) em YouTube Shorts e TikTok a partir de um único artefato gerado.
**Critérios de aceite**:
- Publicação registra um `PublishRecord` por plataforma, com ID externo do post, timestamp e status.
- Retentativa automática (retry com backoff) em falhas transitórias; falha definitiva notifica o tenant.
- Respeita rate limit/quota de cada plataforma.
- Publicação de uma plataforma nunca é bloqueada por falha na outra (isolamento por `PublishRecord`).
**Prioridade**: P0. **Dependências**: RF-09.

### RF-11 — Revisão de conteúdo sensível
**Descrição**: quando a IA sinalizar risco de conteúdo sensível/impróprio, o vídeo aguarda aprovação manual da administração antes de publicar.
**Critérios de aceite**:
- Vídeo fica em estado `PENDING_MODERATION`.
- Admin pode aprovar, rejeitar ou solicitar novo corte.
- SLA de moderação monitorado (ver [observability/observability.md](../observability/observability.md)).
**Prioridade**: P1. **Dependências**: RF-09.

### RF-12 — Notificações
**Descrição**: usuário recebe notificação in-app e por e-mail sobre eventos relevantes (publicação concluída, falha, conta precisa reautenticar, limite de plano atingido).
**Critérios de aceite**:
- Notificação in-app persistida e marcável como lida.
- E-mail transacional enviado em até 1 minuto do evento.
- Usuário pode configurar quais categorias de notificação recebe por e-mail.
**Prioridade**: P1. **Dependências**: RF-10.

### RF-13 — Dashboard de canais, histórico e métricas
**Descrição**: usuário visualiza seus canais e, por canal, a lista de vídeos gerados/publicados com status, plataforma, e métricas (views, likes, comentários, compartilhamentos, retenção, CTR, inscritos, crescimento) atualizadas periodicamente.
**Critérios de aceite**:
- Lista de vídeos paginada, filtrável por canal, plataforma, status e período.
- Métricas atualizadas no mínimo a cada 6h enquanto o vídeo tiver menos de 30 dias.
- Painel do canal mostra métricas agregadas (não só por vídeo individual) e destaca os vídeos mais virais do canal.
- Exportação de relatório em CSV.
**Prioridade**: P1. **Dependências**: RF-10.

### RF-14 — Pausar/retomar Canal
**Descrição**: tenant pode pausar geração automática de um canal específico sem cancelar o plano nem perder histórico, sem afetar os demais canais.
**Critérios de aceite**:
- Pausa entra em vigor no próximo ciclo do Scheduler.
- Vídeos já em processamento no momento da pausa são concluídos normalmente.
**Prioridade**: P1. **Dependências**: RF-04.

### RF-17 — Loop de aprendizado por Canal
**Descrição**: sistema recalcula periodicamente `ChannelInsights` a partir do histórico de métricas do canal (melhores horários, padrões de título com melhor desempenho, hashtags mais associadas a bom desempenho, duração ideal), e usa esses insights como contexto adicional na geração dos vídeos seguintes (ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)).
**Critérios de aceite**:
- Recalculado ao menos uma vez por dia, antes do horário de geração em lote do canal.
- Canal sem histórico suficiente simplesmente gera sem insights adicionais (não é erro).
- `ChannelInsights` é sempre reconstruível a partir de `AnalyticsSnapshot` — nunca editado manualmente.
**Prioridade**: P1. **Dependências**: RF-09, RF-13.

### RF-15 — Administração de nichos e pool de conteúdo (admin console)
**Descrição**: área administrativa restrita para criar/editar nichos, templates de prompt de IA, e gerenciar pool de vídeos-fonte.
**Critérios de aceite**:
- Acesso restrito a usuários com papel `PLATFORM_ADMIN` (fora do RBAC de tenant).
- Ações administrativas são auditadas (quem, quando, o quê).
**Prioridade**: P0. **Dependências**: nenhuma.

### RF-16 — Health e observabilidade operacional
**Descrição**: administração acompanha saúde de filas, workers e integrações externas via dashboard e alertas.
**Critérios de aceite**:
- Health Worker expõe status de cada fila/worker/integração.
- Alertas automáticos quando fila acumula acima de um limiar configurável.
**Prioridade**: P1. **Dependências**: nenhuma.

---

## Rastreabilidade

| Épico (backlog) | Requisitos cobertos |
|---|---|
| EPIC-01 Identidade & Tenant | RF-01, RF-02 |
| EPIC-02 Catálogo & Canais | RF-03, RF-04 |
| EPIC-03 Billing & Planos | RF-08 |
| EPIC-04 Contas Sociais do Canal | RF-05 |
| EPIC-05 Configuração de Geração/Publicação do Canal | RF-06, RF-14 |
| EPIC-06 Pipeline de Geração | RF-07, RF-09, RF-11 |
| EPIC-07 Publicação | RF-10 |
| EPIC-08 Notificações | RF-12 |
| EPIC-09 Dashboard, Analytics & Aprendizado | RF-13, RF-17 |
| EPIC-10 Administração da Plataforma | RF-15, RF-16 |
