# Visão do Produto — Clip Flow

## 1. Visão do Produto

Clip Flow é um SaaS multi-tenant de automação de criação e publicação de vídeos curtos ("shorts") a partir de nichos de conteúdo pré-definidos. O usuário cria um ou mais **Canais**, cada um apontando para um nicho de um catálogo curado (ex.: motivação, finanças, curiosidades, esportes, true crime), conecta as contas do YouTube e/ou TikTok daquele canal, e o sistema passa a produzir e publicar vídeos automaticamente, todos os dias, sem exigir upload, edição ou intervenção manual do usuário.

O valor central do produto é remover o trabalho operacional de criação de conteúdo de nicho: o usuário não precisa gravar, editar, legendar ou agendar nada — apenas criar o canal, escolher o nicho, conectar as contas e definir quantos cortes por dia quer publicar. Todos os dias pela manhã, a IA busca e gera os cortes do dia; ao longo do dia, eles são publicados nos horários mais estratégicos. Um usuário pode ter vários canais, cada um com seu próprio nicho, suas próprias credenciais e suas próprias métricas (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)).

## 2. Objetivos

| # | Objetivo | Métrica de Sucesso |
|---|----------|---------------------|
| O1 | Permitir que um usuário tenha um canal publicando de forma 100% automática | Tempo entre criação do canal e primeira publicação < 24h |
| O2 | Garantir qualidade mínima de vídeo (corte, legenda, formato) sem revisão humana | Taxa de rejeição/remoção por qualidade < 5% |
| O3 | Evitar conteúdo duplicado entre canais (do mesmo ou de tenants distintos) que usam o mesmo nicho | 0 uploads byte-idênticos entre canais distintos |
| O4 | Operar dentro de custo previsível por vídeo gerado (IA + processamento) | Custo unitário monitorado e alertado por limite |
| O5 | Permitir crescimento do catálogo de nichos sem mudança estrutural | Novo nicho publicável via cadastro administrativo, sem deploy de código |
| O6 | Melhorar continuamente o desempenho de cada canal usando seu próprio histórico | `ChannelInsights` disponível e usado na geração a partir do 2º dia com dados suficientes |

## 3. Escopo (MVP)

- Cadastro/autenticação de usuários e organizações (tenants), multi-tenant desde o início.
- Catálogo fixo de nichos pré-cadastrados pela administração da plataforma.
- Criação de Canal por tenant: nome, nicho, idioma, quantidade de vídeos/dia, horários de publicação, plataformas-alvo — respeitando limites do plano contratado (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)).
- Conexão de contas do YouTube e/ou TikTok via OAuth, por canal.
- Pool de vídeos-fonte por nicho, curado pela administração (matéria-prima autorizada/licenciada), compartilhado entre canais.
- Pipeline automático diário: geração em lote pela manhã (transcrição → seleção de trechos por IA → corte/reformatação → legenda → título/descrição/hashtags/CTA → thumbnail opcional), publicação distribuída em horários estratégicos ao longo do dia (ver [ADR-0012](../adr/0012-batch-generation-delayed-publish.md)).
- Publicação automática no YouTube Shorts e/ou TikTok — quando ambas plataformas estão ativas no canal, o mesmo vídeo é espelhado nas duas.
- Coleta de métricas pós-publicação (views, likes, comentários, compartilhamentos, retenção, CTR, inscritos) por vídeo e agregada por canal.
- Loop de aprendizado: insights de desempenho do canal alimentam a geração dos vídeos seguintes (ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)).
- Notificação de sucesso/falha de publicação.
- Painel do usuário (dashboard) com canais, histórico de vídeos publicados e métricas.
- Faturamento (billing) por plano de assinatura.

## 4. Fora do Escopo (MVP)

- Criação de nichos pelo próprio usuário (apenas administração cria; arquitetura já prevê extensão futura — ver [ADR-0006](../adr/0006-content-source-strategy.md)).
- Upload de vídeo-fonte próprio pelo usuário (modo "repurpose pessoal") — candidato a fase 2.
- Edição manual do vídeo gerado (corte manual, timeline, ajuste fino) — candidato a fase 2.
- Geração de vídeo 100% sintético (avatar, talking-head, texto-para-vídeo sem fonte real) — candidato a fase 3.
- Thumbnail gerada sinteticamente por IA de imagem (MVP extrai frame do próprio vídeo — ver [ADR-0013](../adr/0013-thumbnail-frame-extraction.md)).
- Loop de aprendizado via fine-tuning/ML próprio (MVP usa agregação estatística + prompt — ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)).
- Publicação em Instagram Reels, X/Twitter, Facebook Reels — candidato a fase 2.
- Marketplace de nichos entre tenants/canais ou parceiros externos.
- Aplicativo mobile nativo (MVP é web responsivo).
- Colaboração multi-usuário avançada dentro do mesmo tenant (fica limitado a RBAC básico: Owner/Admin/Member).

## 5. Casos de Uso

| ID | Caso de Uso | Ator Principal | Resumo |
|----|-------------|-----------------|--------|
| UC01 | Cadastrar organização e criar conta | Novo Usuário | Usuário cria conta, organização (tenant) é provisionada automaticamente |
| UC02 | Assinar plano | Owner do Tenant | Usuário escolhe plano SaaS (define limites de canais, vídeos/dia por canal) |
| UC03 | Criar canal | Owner/Admin do Tenant | Usuário cria um canal: escolhe nicho, nome, idioma, quantidade de vídeos/dia, horários e plataformas, respeitando limite do plano |
| UC04 | Conectar conta social ao canal | Owner/Admin do Tenant | Usuário autoriza acesso via OAuth ao YouTube e/ou TikTok, no contexto de um canal específico |
| UC05 | Editar configuração do canal | Owner/Admin do Tenant | Usuário altera quantidade de vídeos/dia, horários, idioma ou plataformas de um canal existente |
| UC06 | Geração em lote diária | Sistema (Scheduler/AI/Video Worker) | Todo dia, no horário configurado do canal, o sistema gera de uma vez os N vídeos do dia (seleciona fonte, transcreve, corta, legenda, gera copy e thumbnail) |
| UC07 | Publicação em horários estratégicos | Sistema (Upload Worker) | Cada vídeo do lote é publicado no seu horário-alvo, nas plataformas ativas do canal (espelhando quando "Ambos" está configurado) |
| UC08 | Consultar histórico e métricas | Membro do Tenant | Usuário visualiza, por canal e por vídeo, desempenho (views, likes, comentários, retenção, crescimento) |
| UC09 | Receber notificação de publicação | Membro do Tenant | Usuário é notificado (in-app/e-mail) sobre sucesso ou falha |
| UC10 | Curar nicho e pool de conteúdo-fonte | Administrador da Plataforma | Admin cadastra nicho, prompts de IA associados e ingere vídeos-fonte licenciados |
| UC11 | Monitorar saúde da plataforma | Administrador da Plataforma | Admin acompanha filas, workers, integrações via dashboard de observabilidade |
| UC12 | Pausar/retomar canal | Owner do Tenant | Usuário pausa geração automática de um canal específico sem afetar os demais |

## 6. Personas

### P1 — Criador Solo ("Marina")
Empreendedora digital, sem equipe, quer 1–2 canais monetizados sem produzir conteúdo manualmente. Baixa tolerância a complexidade técnica; quer configurar uma vez e esquecer.

### P2 — Agência de Conteúdo ("Estúdio Nova")
Gerencia vários canais para múltiplos clientes/marcas, cada canal com seu próprio nicho e contas sociais. Precisa de visão consolidada de métricas por canal e por cliente.

### P3 — Administrador da Plataforma ("Time Clip Flow")
Equipe interna responsável por curar nichos, ingerir conteúdo-fonte licenciado, monitorar qualidade de geração e saúde operacional do sistema. Não é tenant — é operador da plataforma.

### P4 — Parceiro de Conteúdo (futuro)
Fornecedor de vídeos-fonte licenciados por nicho, integrado via API/upload em lote. Fora do MVP, mas o domínio (`ContentSource`) já é desenhado para acomodar essa extensão.

## 7. Fluxo Principal (Happy Path)

1. Usuário se cadastra → tenant (organização) é criado automaticamente com plano trial/gratuito.
2. Usuário assina um plano pago (ou segue no trial).
3. Usuário cria um **Canal**: escolhe nicho (ex.: "Futebol"), nome, idioma, 4 vídeos/dia, plataformas = "Ambos" (Shorts + TikTok).
4. Usuário conecta as contas do YouTube e do TikTok àquele canal via OAuth — canal só fica `ACTIVE` quando ambas estão `CONNECTED` (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)).
5. Todo dia, no horário de geração do canal (padrão 06:00, timezone do tenant), o Scheduler Worker dispara **um único** job de geração em lote para aquele canal (ver [ADR-0012](../adr/0012-batch-generation-delayed-publish.md)).
6. AI Worker, para cada um dos 4 vídeos do lote, seleciona um vídeo-fonte do pool do nicho ainda não utilizado por aquele canal, obtém/gera transcrição (Whisper, com cache por vídeo-fonte), e usa IA generativa (Claude/OpenAI) — considerando também `ChannelInsights` do canal, se já existir (ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)) — para identificar o melhor trecho, avaliando melhores momentos, emoção, retenção e potencial viral, e gerar título, descrição, hashtags e CTA.
7. Video Worker corta o trecho (FFmpeg), reenquadra para 9:16 com foco inteligente (OpenCV), queima a legenda sincronizada, extrai thumbnail do melhor frame (se habilitado — [ADR-0013](../adr/0013-thumbnail-frame-extraction.md)) e agenda a publicação para o horário-alvo daquele vídeo dentro do lote.
8. Ao longo do dia, nos horários estratégicos configurados (ex.: 09h, 12h, 16h, 20h), o Upload Worker publica cada vídeo pronto — espelhando em YouTube Shorts e TikTok simultaneamente, já que o canal está configurado como "Ambos".
9. Notification Worker informa o usuário (in-app + e-mail) a cada publicação concluída, com link.
10. Analytics Worker coleta métricas de desempenho de cada vídeo publicado, e periodicamente recalcula `ChannelInsights` a partir do histórico do canal.
11. Usuário acompanha tudo pelo dashboard — por canal e por vídeo — sem necessidade de qualquer ação manual.

## 8. Fluxos Alternativos

- **FA1 — Sem vídeo-fonte disponível**: se o pool do nicho estiver esgotado (todos já usados por aquele canal), o lote gera menos vídeos que o configurado, e o Notification Worker avisa a administração (reposição de conteúdo-fonte necessária).
- **FA2 — Falha de publicação (token expirado/revogado)**: renovação de token é automática por padrão (refresh token — ver [security/secrets-encryption.md](../security/secrets-encryption.md)); apenas quando o próprio refresh token é inválido o Upload Worker marca a `SocialAccount` como `NEEDS_REAUTH`, notifica o usuário para reconectar, e reagenda a publicação após reconexão.
- **FA3 — Falha de moderação/conteúdo sensível**: se a IA sinalizar conteúdo potencialmente sensível, o vídeo vai para fila de revisão manual (admin) antes do seu horário de publicação — a janela entre geração matinal e primeira publicação do dia funciona como tempo de folga para essa revisão.
- **FA4 — Quota da API da plataforma social excedida**: Upload Worker detecta erro de quota (YouTube/TikTok), reagenda o job para o próximo horário disponível e loga o evento para observabilidade.
- **FA5 — Limite do plano atingido**: usuário tenta criar canal, aumentar vídeos/dia ou conectar conta social além do limite do plano; sistema bloqueia a ação e sugere upgrade.
- **FA6 — Cancelamento de assinatura**: ao cancelar, geração automática é pausada em todos os canais do tenant; contas sociais permanecem conectadas (somente leitura de analytics) até o fim do período pago.
- **FA7 — Canal com plataforma pendente de conexão**: canal criado com `platforms = BOTH` mas apenas uma conta conectada permanece em rascunho (não elegível para o Scheduler) até a segunda conta ser conectada.

## 9. Glossário

| Termo | Definição |
|-------|-----------|
| **Tenant** | Organização cliente do SaaS; unidade de isolamento multi-tenant. |
| **Canal (Channel)** | Unidade central de automação: aponta para um nicho, tem suas próprias contas sociais, configuração de geração/publicação e métricas. Um tenant pode ter vários canais (ver [ADR-0011](../adr/0011-channel-as-aggregate.md)). |
| **Nicho (Niche)** | Categoria de conteúdo pré-definida pela administração (ex.: "Futebol", "NBA", "Valorant"), com pool de vídeos-fonte e templates de prompt de IA próprios. |
| **Vídeo-fonte (Source Video)** | Vídeo longo, licenciado/autorizado, associado a um nicho, usado como matéria-prima para geração de cortes. |
| **Corte (Clip)** | Vídeo curto (short) gerado a partir de um trecho do vídeo-fonte. |
| **SocialAccount** | Conta de plataforma social (YouTube/TikTok) conectada a um canal via OAuth. |
| **Lote diário (Batch)** | Conjunto de N vídeos gerados de uma vez, no horário de geração configurado do canal (ver [ADR-0012](../adr/0012-batch-generation-delayed-publish.md)). |
| **Horário estratégico (Publish Slot)** | Um dos horários do dia em que um vídeo do lote é publicado. |
| **GeneratedVideo** | Entidade que representa um vídeo curto gerado pelo pipeline, em qualquer estágio (rascunho, processando, pronto, publicado, falho). |
| **PublishRecord** | Registro de uma publicação específica de um `GeneratedVideo` em uma `SocialAccount`. |
| **ChannelInsights** | Projeção calculada periodicamente a partir do histórico de métricas do canal, usada para melhorar as próximas gerações (ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)). |
| **Plano (Plan)** | Nível de assinatura SaaS que define limites (canais simultâneos, vídeos/dia por canal). |
| **RBAC** | Role-Based Access Control — controle de acesso por papel (Owner, Admin, Member) dentro do tenant. |
| **Worker** | Processo assíncrono especializado que consome jobs de uma fila (BullMQ/Redis). |
| **Pipeline** | Sequência de etapas automatizadas (transcrição → seleção IA → corte → legenda → copy → thumbnail → publicação) que transforma um vídeo-fonte em um `GeneratedVideo` publicado. |
