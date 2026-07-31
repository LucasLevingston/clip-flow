# Roadmap

Sprints de 2 semanas, velocidade estimada de referência: ~24 pontos/sprint (equipe pequena — ajustar após Sprint 1-2 reais). Ordem respeita dependências do backlog (ver [backlog/README.md](../backlog/README.md)). Revisado após [ADR-0011](../adr/0011-channel-as-aggregate.md)–[ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md) — passou de 11 para 13 sprints (Sprint 0–12) por conta do modelo de Canal, geração em lote, thumbnail e loop de aprendizado. Ao final da Sprint 12, o produto atende 100% do escopo MVP definido em [product/vision.md](../product/vision.md).

## Sprint 0 — Fundação Técnica

**Objetivos**: monorepo funcional, schema de banco completo, deploy dos 8 serviços backend + frontend, filas operacionais.
**Issues**: todas de [backlog/issues/EPIC-00-issues.md](../backlog/issues/EPIC-00-issues.md) (24 pontos).
**Riscos**: nenhum risco de produto ainda; risco de subestimar tempo de setup de 8 serviços de deploy (ISSUE-00.F3.S1.T2).
**Dependências**: nenhuma.
**Entregáveis**: `pnpm build`/`lint`/`test` funcionando; deploy de "hello world" em todos os 8 serviços + frontend; banco migrado e populado com seed.

## Sprint 1 — Identidade & Tenant

**Objetivos**: cadastro, login, RBAC básico, convite de membros.
**Issues**: todas de [EPIC-01-issues.md](../backlog/issues/EPIC-01-issues.md) (24 pontos).
**Riscos**: nenhum específico de produto; atenção a RNF-05/06 (segurança de auth) desde o início.
**Dependências**: Sprint 0.
**Entregáveis**: usuário consegue se cadastrar, logar e convidar um segundo membro para o tenant (UC01, UC02 parcial).

## Sprint 2 — Billing & Catálogo

**Objetivos**: planos, assinatura Stripe, catálogo de nichos navegável.
**Issues**: [EPIC-03-issues.md](../backlog/issues/EPIC-03-issues.md) (18 pontos) + `ISSUE-02.F1.S1.T1` (3 pontos).
**Riscos**: risco de setup de conta Stripe/aprovação de negócio levar mais tempo que o previsto.
**Dependências**: Sprint 1.
**Entregáveis**: tenant consegue contratar um plano pago (Stripe Checkout real em modo teste) e navegar o catálogo de nichos.

## Sprint 3 — Criação de Canal + Conexão YouTube

**Objetivos**: criar canal (nicho, config de geração/publicação), conectar conta do YouTube ao canal.
**Issues**: `ISSUE-02.F2.*` (11 pontos) + `ISSUE-04.F1.*` (10 pontos).
**Riscos**: nenhum novo específico.
**Dependências**: Sprint 2.
**Entregáveis**: tenant cria um canal e conecta o YouTube — canal transiciona para `ACTIVE` se `platforms = SHORTS_ONLY` (UC03/UC04 parciais).

## Sprint 4 — TikTok + Renovação de Token + Registro do Scheduler + Wizard

**Objetivos**: conectar TikTok; renovação automática de token; Scheduler Worker reagindo a canais criados; wizard de criação de canal na UI.
**Issues**: `ISSUE-04.F2.S1.T1` (3 pontos) + `ISSUE-04.F3.*` (6 pontos) + `ISSUE-05.F1.S1.T1` (5 pontos) + `ISSUE-05.F2.S1.T1` (8 pontos).
**Riscos**: **R-06** (aprovação do app TikTok para produção) — iniciar processo de submissão à TikTok nesta sprint, mesmo que a aprovação só conclua depois (lead time externo).
**Dependências**: Sprint 3.
**Entregáveis**: canal com `platforms = BOTH` fica `ACTIVE`; usuário cria canal inteiramente pela UI (UC03/UC04 completos).

## Sprint 5 — Configuração UI + Curadoria + Disparo do Lote

**Objetivos**: tela de edição de canal; curadoria de conteúdo-fonte (admin); Scheduler Worker disparando o lote diário.
**Issues**: `ISSUE-05.F2.S1.T2` (5 pontos) + `ISSUE-06.F1.*` (8 pontos) + `ISSUE-06.F2.*` (11 pontos).
**Riscos**: **R-01** (curadoria de conteúdo é gargalo) — equipe de conteúdo deve começar a ingerir vídeos-fonte em paralelo a esta sprint, não depois.
**Dependências**: Sprint 4.
**Entregáveis**: Scheduler Worker dispara lote real de `GenerationScheduled` para pelo menos 1 canal com conteúdo-fonte aprovado (UC06 início).

## Sprint 6 — AI Worker

**Objetivos**: transcrição, seleção de trecho, geração de copy (título/descrição/hashtags/CTA), diversidade entre canais, moderação.
**Issues**: `ISSUE-06.F3.*` completo (24 pontos).
**Riscos**: **R-02** (custo de IA) — instrumentar registro de custo por chamada desde o primeiro teste real, não retroativamente.
**Dependências**: Sprint 5.
**Entregáveis**: pipeline gera `GeneratedVideo` com `highlight`+`copy` reais a partir de um vídeo-fonte real (UC06 até a etapa de conteúdo).

## Sprint 7 — Video Worker

**Objetivos**: corte, reenquadramento inteligente, legenda queimada, thumbnail, agendamento da publicação atrasada.
**Issues**: `ISSUE-06.F4.*` completo (27 pontos).
**Riscos**: R-03 (qualidade de reenquadramento), R-05 (CPU-bound não escalar) — medir tempo real de processamento nesta sprint para calibrar RNF-02.
**Dependências**: Sprint 6.
**Entregáveis**: primeiro vídeo curto gerado ponta a ponta (fonte → arquivo final 9:16 com legenda e thumbnail), job de publicação já enfileirado com delay — ainda sem execução da publicação em si.

## Sprint 8 — Moderação e Publicação

**Objetivos**: fila de moderação; publicação real no YouTube e TikTok com idempotência e espelhamento.
**Issues**: `ISSUE-06.F5.S1.T1` (5 pontos) + [EPIC-07-issues.md](../backlog/issues/EPIC-07-issues.md) (18 pontos).
**Riscos**: R-04 (conteúdo duplicado entre canais — já mitigado no Sprint 6, validar em publicação real), R-06 (se TikTok ainda não aprovado, publicar YouTube-only temporariamente).
**Dependências**: Sprint 7.
**Entregáveis**: **primeiro vídeo publicado automaticamente de ponta a ponta**, espelhado em ambas as plataformas quando aplicável — marco central do MVP (fluxo principal completo, [product/vision.md](../product/vision.md) seção 7).

## Sprint 9 — Notificações e Coleta de Analytics

**Objetivos**: notificações in-app/e-mail; coleta de métricas pós-publicação.
**Issues**: [EPIC-08-issues.md](../backlog/issues/EPIC-08-issues.md) (18 pontos) + `ISSUE-09.F1.S1.T1`, `ISSUE-09.F1.S1.T2` (10 pontos).
**Riscos**: nenhum novo; atenção a rate limit das APIs de analytics das plataformas.
**Dependências**: Sprint 8.
**Entregáveis**: usuário é notificado de cada publicação; métricas começam a ser coletadas automaticamente.

## Sprint 10 — Loop de Aprendizado e Dashboard Completo

**Objetivos**: recálculo de `ChannelInsights`; dashboard de canais/vídeos/métricas/insights.
**Issues**: `ISSUE-09.F1.S1.T3` (8 pontos) + `ISSUE-09.F2.*` (18 pontos).
**Riscos**: qualidade dos primeiros insights pode ser baixa com pouco histórico — canal precisa de volume mínimo antes de confiar no insight (`HasSufficientHistoryForInsightsSpecification`).
**Dependências**: Sprint 9.
**Entregáveis**: usuário acompanha tudo pelo dashboard sem depender de suporte, incluindo o que a IA está aprendendo do canal (RF-17 completo).

## Sprint 11 — Administração da Plataforma

**Objetivos**: console administrativo de nichos/curadoria; Health Worker + dashboard operacional.
**Issues**: [EPIC-10-issues.md](../backlog/issues/EPIC-10-issues.md) completo (21 pontos).
**Riscos**: nenhum novo.
**Dependências**: Sprint 10.
**Entregáveis**: equipe administra nichos e monitora saúde da plataforma sem acesso direto ao banco.

## Sprint 12 — Hardening

**Objetivos**: testes E2E das jornadas críticas; revisão de segurança e performance antes de abrir para mais usuários; buffer de débito técnico.
**Issues**: buffer de correções identificadas nas sprints anteriores (sem issues pré-definidas).
**Riscos**: R-11 (limites de plano gerenciado), R-14 (isolamento multi-tenant) — dedicar tempo explícito de teste de isolamento e carga nesta sprint.
**Dependências**: Sprint 11.
**Entregáveis**: MVP completo, monitorado, testado E2E — pronto para primeiros clientes reais fora da equipe.

## Sprint MVP-1 — Fluxo Principal Ponta a Ponta (Happy Path)

**Objetivos**: com todo o backlog do MVP (Sprint 0–12) implementado por camada, esta sprint conecta as peças em um fluxo real navegável: login → criar canal → conectar YouTube/TikTok → escolher nicho → configurar (quantidade de Shorts/dia, horários, idioma, prompt) → salvar no Supabase → disparar o Scheduler manualmente pelo Dashboard → acompanhar status/fila/vídeos gerados/próximos agendamentos. Trabalho em fatias verticais (Vertical Slice Architecture): cada fatia entrega algo utilizável pelo usuário, com testes unit/integration/E2E, antes de iniciar a próxima.
**Fatias entregues**:

1. **Sessão real + login UI + proteção de rota** — `@fastify/cors` na API; access token em `localStorage`, refresh token em cookie httpOnly; `LoginForm`/`RegisterForm`/`RequireAuth`/`AppHeader`; grupo de rotas `(app)` protegido.
2. **Conexão de contas sociais pela UI** — fluxo OAuth completo (YouTube/TikTok) via `SocialAccountsPanel`, `sessionStorage` para sobreviver ao redirect de página inteira, página `/oauth/callback` compartilhada, connect/reauth/disconnect.
3. **Disparo manual do Scheduler pelo Dashboard** — endpoint `POST /v1/channels/:channelId/generate-now` (reaproveita o job `GenerationBatch` já consumido pelo Scheduler Worker, sem alteração no worker) + botão "Run now" no `ChannelSettingsForm`.
4. **Dashboard — próximos agendamentos** — `UpcomingSchedulePanel` exibindo horário de geração diária e horários de publicação do canal ativo. Status de processamento, fila e vídeos gerados já eram cobertos pelo `VideoList`/`VideoFilters` (Sprint 10); não foi necessário trabalho novo para esses três itens.
   **Escopo explicitamente fora desta sprint**: painel de logs por tenant — não existe modelo de dados para consumo de logs por tenant (`AuditLog` é exclusivo de platform admin, ver EPIC-10); construir UI sem dado real seria apenas aparência, não funcionalidade.
   **Critério de aceite**: abrir a aplicação, logar, criar um canal, conectá-lo a pelo menos uma plataforma, configurar nicho/horários, disparar o pipeline manualmente e acompanhar o fluxo completo pelo Dashboard — integrações externas (YouTube/TikTok/IA) podem usar mocks temporários onde ainda não há credencial real disponível.
   **Dependências**: Sprint 0–12 (todo o MVP por camada).

## Sprint MVP-2 — Automated Content Pipeline (Core)

**Objetivos**: com o fluxo principal navegável (Sprint MVP-1), esta sprint reforça o pipeline de automação em si — descoberta de conteúdo, seleção do melhor candidato, recuperação de erro e visibilidade em tempo real — extendendo o pipeline existente (Sprint 5–8: scheduler → ai → video → upload) em vez de duplicá-lo.
**Decisão de arquitetura**: o pedido original descrevia uma tabela `VideoJob` nova e 6 workers dedicados por estágio. Avaliado e descartado — o pipeline existente já cobre exatamente esses estágios em 3 workers testados, com o estado rastreado em `GeneratedVideo.status` (9 valores). Duplicar isso teria dobrado a superfície de manutenção sem ganho real. Cada fatia abaixo estende o que existe.
**Fatias entregues**:

1. **EPIC-01 — Content Discovery** — `ContentSourceConfig` (Strategy Pattern, ADR-0006) com 3 providers (`RSS_FEED`, `LOCAL_FOLDER`, `PARTNER_API`); descoberta ingere candidatos como `SourceVideo(PENDING_REVIEW)` — o gate de aprovação humana da curadoria existente permanece intacto. Deliberadamente **não** construído: um provider de scraping do YouTube — ADR-0006 já rejeitou isso permanentemente por risco legal; os 3 providers cobrem exatamente os casos de extensão que o ADR nomeia (feed de parceiro licenciado, upload direto de criador).
2. **EPIC-02 — AI Ranking Service** — `rankSourceVideoCandidates` pontua um pool 5x maior que `videosPerDay` por qualidade (nova `SourceVideo.qualityScore`, capturada na aprovação existente), aderência de duração, frescor e idioma (nova `SourceVideo.language`); "potencial viral" não tem sinal real pré-publicação e não foi fabricado como número — dobrado na pontuação de qualidade do admin.
3. **EPIC-11 — Error Recovery** — todo job em todas as 7 filas ganha 3 tentativas com backoff exponencial (`createQueueProducer`); um job que esgota as tentativas vai para `<fila>-dlq` em vez de desaparecer. O tratamento de erro de negócio dentro de cada worker (marca FAILED, notifica, não relança) permanece — mudar isso para also distinguir erro-transitório-vs-terminal é trabalho futuro maior, não deste slice.
4. **EPIC-09 — Dashboard em tempo real** — `PipelinePanel` no detalhe do canal, com polling de 5s, mostrando contagem por estágio e fila ordenada dos vídeos não-terminais — item explícito do critério de aceite ("ver a fila atualizada em tempo real").

**Explicitamente adiado desta sprint** (ver rationale nos commits): EPIC-05 (detecção de cena independente — hoje o corte usa o highlight escolhido pela IA), EPIC-06 (motor de variáveis de prompt formal), EPIC-07 (SEO — keywords/comentário fixado, além de título/descrição/hashtags/CTA já existentes; e uma UI dedicada para exibir esses metadados ao tenant, que hoje só existem na resposta da API `GET /v1/videos/:id`, sem tela própria), EPIC-08 (persistir legendas/JSON de metadados/prompt+resposta no Storage, além de vídeo final+thumbnail já persistidos). Nenhum bloqueia o critério de aceite desta sprint no nível de dado; cada um é um slice vertical próprio, não um ajuste pequeno.
**Critério de aceite**: criar canal, configurar nicho, executar o Scheduler, ver Jobs sendo criados e Workers processando (`PipelinePanel`), ver vídeos armazenados no Supabase Storage, ver a fila atualizada em tempo real no Dashboard. "Ver metadados gerados pela IA" é atendido parcialmente — o dado existe e é retornado pela API, mas uma tela dedicada de detalhe do vídeo fica para o próximo slice (parte do EPIC-07 adiado).
**Dependências**: Sprint MVP-1.

## Após Sprint 12 (Fase 2 — fora do escopo desta documentação)

Upload de vídeo-fonte próprio pelo tenant, edição manual do corte, publicação em Instagram Reels/outras plataformas, criação de nicho pelo próprio tenant, thumbnail gerada sinteticamente por IA, loop de aprendizado via fine-tuning, marketplace de conteúdo-fonte com parceiros (ver [product/vision.md](../product/vision.md) seção 4 — Fora do Escopo).
