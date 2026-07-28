# EPIC-06 — Pipeline de Geração

Cobre RF-07, RF-09, RF-11. Épico central do produto — maior densidade de tasks. Revisado após [ADR-0011](../../adr/0011-channel-as-aggregate.md) (Channel), [ADR-0012](../../adr/0012-batch-generation-delayed-publish.md) (lote diário), [ADR-0013](../../adr/0013-thumbnail-frame-extraction.md) (thumbnail) e [ADR-0014](../../adr/0014-learning-loop-prompt-augmentation.md) (insights).

## Feature EPIC-06.F1 — Curadoria de Conteúdo-Fonte (Admin)

### História EPIC-06.F1.S1 — Ingestão e aprovação de `SourceVideo`

**EPIC-06.F1.S1.T1 — Domain: `SourceVideo`, `LicenseInfo`, `PromptTemplate`**
- Objetivo: base de domínio do Content Catalog (ver [domain/entities-value-objects.md](../../domain/entities-value-objects.md)).
- Descrição: entidades e invariante "`APPROVED` exige `LicenseInfo` válido".
- Arquivos: `apps/api/src/domain/catalog/entities/SourceVideo.ts`, `PromptTemplate.ts`.
- Dependências: EPIC-02.
- Critérios de aceite: aprovação sem `LicenseInfo` é rejeitada no domínio (não só na validação de API).
- Testes obrigatórios: unitário (invariante de licença).
- Estimativa: 3 pontos.
- Checklist: [ ] `licenseType` restrito ao enum documentado em [ADR-0006](../../adr/0006-content-source-strategy.md).

**EPIC-06.F1.S1.T2 — `CurateSourceVideoUseCase` + `POST /v1/admin/source-videos`, `PATCH /v1/admin/source-videos/:id/review`**
- Objetivo: implementar RF-07.
- Descrição: ingestão em `PENDING_REVIEW`, aprovação/rejeição pelo admin.
- Arquivos: `apps/api/src/application/use-cases/catalog/CurateSourceVideoUseCase.ts`, controllers admin.
- Dependências: EPIC-06.F1.S1.T1, EPIC-10 (RBAC de `PLATFORM_ADMIN`).
- Critérios de aceite: conforme [api/admin-api.md](../../api/admin-api.md).
- Testes obrigatórios: integração (fluxo completo ingestão → aprovação → disponível para seleção).
- Estimativa: 5 pontos.
- Checklist: [ ] ação registrada em `audit_log` (ver [database/audit-soft-delete-versioning.md](../../database/audit-soft-delete-versioning.md)).

## Feature EPIC-06.F2 — Disparo do Lote Diário

### História EPIC-06.F2.S1 — Geração em lote

**EPIC-06.F2.S1.T1 — Especificações de pré-condição (`IsSourceVideoAvailableForChannelSpecification`, `IsChannelReadyToPublishSpecification`, etc.)**
- Objetivo: implementar predicados puros de [domain/policies-specifications.md](../../domain/policies-specifications.md).
- Descrição: cada Specification é uma função/classe testável isoladamente.
- Arquivos: `apps/workers/src/scheduler/domain/specifications/*.ts`.
- Dependências: EPIC-05.F1 (repeatable job já disparando), EPIC-06.F1.
- Critérios de aceite: cada Specification cobre exatamente o predicado documentado.
- Testes obrigatórios: unitário (1 teste por especificação, casos verdadeiro/falso).
- Estimativa: 3 pontos.
- Checklist: [ ] nenhuma Specification acessa banco diretamente (recebe dado já carregado).

**EPIC-06.F2.S1.T2 — `TriggerDailyGenerationUseCase` (lote de N vídeos por canal)**
- Objetivo: implementar disparo diário em lote (ver [architecture/scheduler-flow.md](../../architecture/scheduler-flow.md), [ADR-0012](../../adr/0012-batch-generation-delayed-publish.md)).
- Descrição: ao repeatable job disparar (registrado pelo EPIC-05.F1), verifica specifications, aloca `scheduledPublishAt` por vídeo a partir de `Channel.publishTimes`, cria N `GeneratedVideo` via `GeneratedVideoFactory` e emite N `GenerationScheduled`.
- Arquivos: `apps/workers/src/scheduler/application/use-cases/TriggerDailyGenerationUseCase.ts`.
- Dependências: EPIC-06.F2.S1.T1.
- Critérios de aceite: `(channelId, batchRunId, scheduledPublishAt)` único evita duplicidade (RNF-34); FA1/FA7 tratados sem lançar exceção não capturada; falha em obter fonte para 1 vídeo não impede os demais do lote.
- Testes obrigatórios: unitário (idempotência, alocação de slots); integração (repeatable job real com Redis efêmero, disparo e reprocessamento no mesmo dia não duplica o lote).
- Estimativa: 8 pontos.
- Checklist: [ ] alerta publicado em FA1 (pool insuficiente para o lote completo).

## Feature EPIC-06.F3 — AI Worker

### História EPIC-06.F3.S1 — Transcrição

**EPIC-06.F3.S1.T1 — `WhisperAdapter` + cache de `Transcript`**
- Objetivo: implementar transcrição com cache (ver [integrations/whisper.md](../../integrations/whisper.md)).
- Descrição: implementa `TranscriptionProvider`; verifica cache por `sourceVideoId` antes de chamar Whisper.
- Arquivos: `apps/workers/src/ai/infrastructure/adapters/WhisperAdapter.ts`, `TranscriptRepository`.
- Dependências: EPIC-06.F2.
- Critérios de aceite: segunda chamada para o mesmo `sourceVideoId` não invoca Whisper novamente.
- Testes obrigatórios: unitário (dublê de Whisper); integração (cache hit/miss real no banco).
- Estimativa: 5 pontos.
- Checklist: [ ] timeout de 5 min aplicado (RNF-35).

### História EPIC-06.F3.S2 — Seleção de trecho e geração de copy

**EPIC-06.F3.S2.T1 — `ClaudeAdapter` + `OpenAiAdapter` + `AiProviderFallbackPolicy`**
- Objetivo: implementar estratégia dual de IA (ver [ADR-0008](../../adr/0008-ai-provider-strategy-claude-openai.md)).
- Descrição: ambos implementam `AiCompletionProvider`; policy decide quando cair para fallback.
- Arquivos: `apps/workers/src/ai/infrastructure/adapters/ClaudeAdapter.ts`, `OpenAiAdapter.ts`, `apps/workers/src/ai/domain/policies/AiProviderFallbackPolicy.ts`.
- Dependências: EPIC-06.F3.S1.T1.
- Critérios de aceite: falha/timeout do Claude aciona OpenAI automaticamente, sem falhar o job.
- Testes obrigatórios: unitário (policy com dublês simulando timeout/erro/sucesso); teste de contrato garantindo que ambos adapters retornam o mesmo formato.
- Estimativa: 8 pontos.
- Checklist: [ ] custo de cada chamada registrado (RNF-21).

**EPIC-06.F3.S2.T2 — `HighlightDiversityService` + `HighlightDiversityPolicy`**
- Objetivo: implementar anti-duplicidade entre canais (ver [ADR-0006](../../adr/0006-content-source-strategy.md)).
- Descrição: calcula sobreposição de tempo entre seleções já usadas para o mesmo `sourceVideoId`.
- Arquivos: `apps/workers/src/ai/domain/services/HighlightDiversityService.ts`.
- Dependências: EPIC-06.F3.S2.T1.
- Critérios de aceite: rejeita seleção com sobreposição > 40%.
- Testes obrigatórios: unitário (cenários de sobreposição 0%, 20%, 41%, 100%).
- Estimativa: 3 pontos.
- Checklist: [ ] serviço puro, sem I/O.

**EPIC-06.F3.S2.T3 — `GenerateVideoContentUseCase` + `ContentModerationPolicy` + uso de `ChannelInsights`**
- Objetivo: orquestrar a etapa completa de IA (ver [architecture/ai-flow.md](../../architecture/ai-flow.md), [ADR-0014](../../adr/0014-learning-loop-prompt-augmentation.md)).
- Descrição: integra transcrição, seleção, diversidade, geração de copy (título/descrição/hashtags/CTA) e checagem de moderação; carrega `ChannelInsights` do canal (se existir) como contexto adicional; atualiza `GeneratedVideo` e emite eventos.
- Arquivos: `apps/workers/src/ai/application/use-cases/GenerateVideoContentUseCase.ts`.
- Dependências: EPIC-06.F3.S1, EPIC-06.F3.S2.T1, T2, EPIC-09.F1.S1.T2 (`ChannelInsights` — opcional, canal pode não ter ainda).
- Critérios de aceite: conforme máquina de estados em [domain/entities-value-objects.md](../../domain/entities-value-objects.md); ausência de `ChannelInsights` não é erro.
- Testes obrigatórios: unitário do Use Case completo (todos os ramos: sucesso, moderação, falha, com e sem insights); integração ponta a ponta com Redis/DB efêmeros e adapters de IA mockados.
- Estimativa: 8 pontos.
- Checklist: [ ] `VideoContentGenerationFailed` emitido em toda falha definitiva.

## Feature EPIC-06.F4 — Video Worker

### História EPIC-06.F4.S1 — Corte e reenquadramento

**EPIC-06.F4.S1.T1 — `VideoProcessingService` (FFmpeg: corte + encode)**
- Objetivo: implementar corte/encode (ver [integrations/ffmpeg.md](../../integrations/ffmpeg.md)).
- Descrição: serviço de infraestrutura que invoca FFmpeg via `child_process`, isolado atrás de interface de domínio.
- Arquivos: `apps/workers/src/video/infrastructure/services/FfmpegVideoProcessingService.ts`.
- Dependências: EPIC-06.F3.
- Critérios de aceite: exit code ≠ 0 é capturado e traduzido em exceção de domínio.
- Testes obrigatórios: integração com binário FFmpeg real em vídeo de teste curto (fixture).
- Estimativa: 8 pontos.
- Checklist: [ ] limpeza de arquivos temporários garantida (`finally`).

**EPIC-06.F4.S1.T2 — `FocusDetector` (OpenCV: detecção de foco + crop dinâmico)**
- Objetivo: implementar reenquadramento inteligente (ver [integrations/opencv.md](../../integrations/opencv.md)).
- Descrição: amostra frames, detecta rosto, calcula centro de massa, fallback para crop central.
- Arquivos: `apps/workers/src/video/infrastructure/services/OpenCvFocusDetector.ts`.
- Dependências: EPIC-06.F4.S1.T1.
- Critérios de aceite: ausência de rosto detectado não falha o job (fallback).
- Testes obrigatórios: integração com fixtures de vídeo (com e sem rosto detectável).
- Estimativa: 8 pontos.
- Checklist: [ ] modelo de detecção versionado junto ao build da imagem Docker.

**EPIC-06.F4.S1.T3 — `ThumbnailFrameSelector`**
- Objetivo: implementar extração de thumbnail sem custo adicional de IA (ver [ADR-0013](../../adr/0013-thumbnail-frame-extraction.md)).
- Descrição: reaproveita os frames amostrados pela detecção de foco (T2) e escolhe o de maior nitidez (variância de Laplaciano).
- Arquivos: `apps/workers/src/video/domain/services/ThumbnailFrameSelector.ts`.
- Dependências: EPIC-06.F4.S1.T2.
- Critérios de aceite: retorna `null` quando `Channel.thumbnailEnabled = false`, sem custo de processamento extra.
- Testes obrigatórios: unitário (seleção de frame mais nítido entre um conjunto de fixtures).
- Estimativa: 3 pontos.
- Checklist: [ ] serviço puro, sem I/O de rede.

**EPIC-06.F4.S1.T4 — `CutVideoUseCase` + `VideoQualityGate` + agendamento de publicação atrasada**
- Objetivo: orquestrar a etapa completa de corte (ver [workers/video-worker.md](../../workers/video-worker.md), [ADR-0012](../../adr/0012-batch-generation-delayed-publish.md)).
- Descrição: integra corte, detecção de foco, legenda queimada, thumbnail, valida qualidade mínima antes de `READY_TO_PUBLISH`, e enfileira job de publicação com `delay` até `scheduledPublishAt`.
- Arquivos: `apps/workers/src/video/application/use-cases/CutVideoUseCase.ts`, `apps/workers/src/video/domain/services/VideoQualityGate.ts`.
- Dependências: EPIC-06.F4.S1.T1, T2, T3.
- Critérios de aceite: conforme máquina de estados; `VideoProcessingFailed` emitido em falha definitiva; delay calculado corretamente (0 se `scheduledPublishAt` já passou).
- Testes obrigatórios: unitário do Use Case (dublês de FFmpeg/OpenCV); integração ponta a ponta com binários reais em fixture curta, incluindo verificação do delay do job enfileirado.
- Estimativa: 8 pontos.
- Checklist: [ ] timeout de 10 min aplicado (RNF-35).

## Feature EPIC-06.F5 — Moderação de Conteúdo

### História EPIC-06.F5.S1 — Fila de revisão manual

**EPIC-06.F5.S1.T1 — `GET /v1/admin/moderation-queue` + `PATCH /v1/admin/moderation-queue/:id`**
- Objetivo: implementar RF-11 (revisão de conteúdo sensível, FA3).
- Descrição: admin aprova/rejeita `GeneratedVideo` em `PENDING_MODERATION`; aprovação segue para corte.
- Arquivos: `apps/api/src/application/use-cases/content-generation/ReviewFlaggedVideoUseCase.ts`, controllers admin.
- Dependências: EPIC-06.F3.S2.T3, EPIC-10.
- Critérios de aceite: conforme [api/admin-api.md](../../api/admin-api.md).
- Testes obrigatórios: integração (aprovação transiciona corretamente para `CONTENT_READY` → segue pipeline).
- Estimativa: 5 pontos.
- Checklist: [ ] SLA de moderação monitorado (ligação com EPIC-10 observabilidade).
