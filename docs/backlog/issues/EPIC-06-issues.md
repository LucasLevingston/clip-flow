# Issues — EPIC-06 Pipeline de Geração

> Revisado após [ADR-0011](../../adr/0011-channel-as-aggregate.md), [ADR-0012](../../adr/0012-batch-generation-delayed-publish.md), [ADR-0013](../../adr/0013-thumbnail-frame-extraction.md), [ADR-0014](../../adr/0014-learning-loop-prompt-augmentation.md).

---

### ISSUE-06.F1.S1.T1 — Domain: SourceVideo, LicenseInfo, PromptTemplate
**Descrição**: entidades do Content Catalog com invariante de licença.
**Objetivo**: garantir que nenhum vídeo-fonte sem licença documentada pode ser aprovado.
**Motivação**: é a proteção legal central do produto (ver [ADR-0006](../../adr/0006-content-source-strategy.md), risco R-17).
**Arquivos envolvidos**: `apps/api/src/domain/catalog/entities/SourceVideo.ts`, `PromptTemplate.ts`.
**Critérios de aceite**: aprovação sem `LicenseInfo` é rejeitada no domínio.
**Critérios de teste**: unitário (invariante de licença).
**Checklist**: [ ] `licenseType` restrito ao enum documentado.
**Dependências**: EPIC-02.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:domain`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-06.F1.S1.T2 — CurateSourceVideoUseCase + endpoints admin
**Descrição**: ingestão e aprovação de vídeo-fonte.
**Objetivo**: implementar RF-07.
**Motivação**: sem vídeo-fonte aprovado, nenhum canal consegue gerar conteúdo — é o maior risco operacional do MVP (R-01).
**Arquivos envolvidos**: `apps/api/src/application/use-cases/catalog/CurateSourceVideoUseCase.ts`, controllers admin.
**Critérios de aceite**: conforme [api/admin-api.md](../../api/admin-api.md).
**Critérios de teste**: integração (ingestão → aprovação → disponível para seleção).
**Checklist**: [ ] ação registrada em `audit_log`.
**Dependências**: ISSUE-06.F1.S1.T1, EPIC-10.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:api`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-06.F2.S1.T1 — Specifications de pré-condição do lote diário
**Descrição**: predicados puros de disponibilidade de fonte/canal pronto para publicar.
**Objetivo**: isolar regra de decisão do disparo diário em unidades testáveis.
**Motivação**: bugs de pré-condição geram geração indevida (custo desnecessário de IA) ou lote incompleto silencioso — precisa ser exaustivamente testado.
**Arquivos envolvidos**: `apps/workers/src/scheduler/domain/specifications/*.ts`.
**Critérios de aceite**: cada Specification cobre exatamente o predicado documentado.
**Critérios de teste**: unitário (1 por especificação, casos verdadeiro/falso).
**Checklist**: [ ] nenhuma Specification acessa banco diretamente.
**Dependências**: EPIC-05.F1, ISSUE-06.F1.S1.T2.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:domain`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-06.F2.S1.T2 — TriggerDailyGenerationUseCase (lote de N vídeos)
**Descrição**: disparo diário do pipeline em lote por canal.
**Objetivo**: implementar o coração do disparo diário (ver [architecture/scheduler-flow.md](../../architecture/scheduler-flow.md)).
**Motivação**: é o gatilho que torna o produto "automático" — gera todos os vídeos do dia de uma vez, cada um já com seu horário de publicação atribuído.
**Arquivos envolvidos**: `apps/workers/src/scheduler/application/use-cases/TriggerDailyGenerationUseCase.ts`.
**Critérios de aceite**: `(channelId, batchRunId, scheduledPublishAt)` único evita duplicidade; FA1/FA7 tratados sem exceção não capturada; falha em 1 vídeo não trava os demais do lote.
**Critérios de teste**: unitário (idempotência, alocação de slots); integração (repeatable job real, reprocessamento no mesmo dia não duplica o lote).
**Checklist**: [ ] alerta publicado em FA1 (pool insuficiente).
**Dependências**: ISSUE-06.F2.S1.T1.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-06.F3.S1.T1 — WhisperAdapter + cache de Transcript
**Descrição**: transcrição de vídeo-fonte com cache por `sourceVideoId`.
**Objetivo**: implementar a primeira etapa do AI Worker.
**Motivação**: cache é o que torna o custo de IA sustentável entre canais (RNF-21) — sem ele, cada canal pagaria por transcrever o mesmo vídeo.
**Arquivos envolvidos**: `apps/workers/src/ai/infrastructure/adapters/WhisperAdapter.ts`, `TranscriptRepository`.
**Critérios de aceite**: segunda chamada para o mesmo vídeo-fonte não invoca Whisper novamente.
**Critérios de teste**: unitário (dublê); integração (cache hit/miss real).
**Checklist**: [ ] timeout de 5 min aplicado.
**Dependências**: ISSUE-06.F2.S1.T2.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).

---

### ISSUE-06.F3.S2.T1 — ClaudeAdapter + OpenAiAdapter + AiProviderFallbackPolicy
**Descrição**: estratégia dual de IA generativa.
**Objetivo**: implementar [ADR-0008](../../adr/0008-ai-provider-strategy-claude-openai.md).
**Motivação**: resiliência do pipeline depende de não ter ponto único de falha de IA.
**Arquivos envolvidos**: `ClaudeAdapter.ts`, `OpenAiAdapter.ts`, `AiProviderFallbackPolicy.ts`.
**Critérios de aceite**: falha/timeout do Claude aciona OpenAI automaticamente.
**Critérios de teste**: unitário (policy com dublês); teste de contrato (mesmo formato de saída).
**Checklist**: [ ] custo de cada chamada registrado.
**Dependências**: ISSUE-06.F3.S1.T1.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-06.F3.S2.T2 — HighlightDiversityService + Policy
**Descrição**: anti-duplicidade de conteúdo entre canais.
**Objetivo**: implementar mitigação central de R-04.
**Motivação**: conteúdo idêntico entre canais do mesmo nicho arrisca penalização das plataformas sociais para todos os clientes.
**Arquivos envolvidos**: `apps/workers/src/ai/domain/services/HighlightDiversityService.ts`.
**Critérios de aceite**: rejeita seleção com sobreposição > 40%.
**Critérios de teste**: unitário (0%, 20%, 41%, 100% de sobreposição).
**Checklist**: [ ] serviço puro, sem I/O.
**Dependências**: ISSUE-06.F3.S2.T1.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:domain`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Média. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-06.F3.S2.T3 — GenerateVideoContentUseCase + ContentModerationPolicy + uso de ChannelInsights
**Descrição**: orquestração completa da etapa de IA, incluindo contexto de aprendizado do canal.
**Objetivo**: integrar transcrição, seleção, diversidade, copy (título/descrição/hashtags/CTA), moderação e `ChannelInsights` em um único Use Case coerente.
**Motivação**: é o ponto onde todas as peças do AI Worker se encontram, incluindo o loop de aprendizado (RF-17) — maior superfície de risco de bug do épico.
**Arquivos envolvidos**: `apps/workers/src/ai/application/use-cases/GenerateVideoContentUseCase.ts`.
**Critérios de aceite**: conforme máquina de estados de `GeneratedVideo`; ausência de `ChannelInsights` não é erro.
**Critérios de teste**: unitário (todos os ramos, com e sem insights); integração ponta a ponta (Redis/DB efêmeros, IA mockada).
**Checklist**: [ ] `VideoContentGenerationFailed` emitido em toda falha definitiva.
**Dependências**: ISSUE-06.F3.S1.T1, ISSUE-06.F3.S2.T1, ISSUE-06.F3.S2.T2.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-06.F4.S1.T1 — VideoProcessingService (FFmpeg)
**Descrição**: corte e encode do trecho selecionado.
**Objetivo**: implementar a primeira metade do Video Worker.
**Motivação**: é a etapa que efetivamente produz o artefato de vídeo — sem ela, nada é publicável.
**Arquivos envolvidos**: `apps/workers/src/video/infrastructure/services/FfmpegVideoProcessingService.ts`.
**Critérios de aceite**: exit code ≠ 0 tratado como exceção de domínio.
**Critérios de teste**: integração com FFmpeg real em fixture curta.
**Checklist**: [ ] limpeza de temporários garantida (`finally`).
**Dependências**: ISSUE-06.F3.S2.T3.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-06.F4.S1.T2 — FocusDetector (OpenCV)
**Descrição**: detecção de foco e cálculo de crop dinâmico 9:16.
**Objetivo**: implementar o diferencial de qualidade do produto (Objetivo O2).
**Motivação**: reenquadramento ruim é a forma mais visível de o usuário perceber "geração automática de baixa qualidade".
**Arquivos envolvidos**: `apps/workers/src/video/infrastructure/services/OpenCvFocusDetector.ts`.
**Critérios de aceite**: ausência de rosto não falha o job (fallback central).
**Critérios de teste**: integração com fixtures (com e sem rosto).
**Checklist**: [ ] modelo de detecção versionado na imagem Docker.
**Dependências**: ISSUE-06.F4.S1.T1.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-06.F4.S1.T3 — ThumbnailFrameSelector
**Descrição**: extração de thumbnail do próprio vídeo, sem custo de IA adicional.
**Objetivo**: implementar RF-09 (thumbnail opcional) conforme [ADR-0013](../../adr/0013-thumbnail-frame-extraction.md).
**Motivação**: thumbnail de qualidade impacta diretamente CTR nas plataformas, mas uma nova integração de geração de imagem inflaria custo/complexidade desnecessariamente no MVP.
**Arquivos envolvidos**: `apps/workers/src/video/domain/services/ThumbnailFrameSelector.ts`.
**Critérios de aceite**: retorna `null` quando `Channel.thumbnailEnabled = false`, sem custo de processamento extra.
**Critérios de teste**: unitário (seleção de frame mais nítido entre fixtures).
**Checklist**: [ ] serviço puro, sem I/O de rede.
**Dependências**: ISSUE-06.F4.S1.T2.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:worker`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Baixa. **Tempo estimado**: 1.5 dia (3 pontos).

---

### ISSUE-06.F4.S1.T4 — CutVideoUseCase + VideoQualityGate + agendamento de publicação atrasada
**Descrição**: orquestração completa da etapa de corte, incluindo o agendamento do job de publicação.
**Objetivo**: produzir `GeneratedVideo.finalAssetUrl`/`thumbnailUrl` prontos e agendar a publicação no horário-alvo.
**Motivação**: fecha o pipeline de produção de conteúdo — próxima etapa é diretamente a publicação atrasada (EPIC-07), conforme [ADR-0012](../../adr/0012-batch-generation-delayed-publish.md).
**Arquivos envolvidos**: `apps/workers/src/video/application/use-cases/CutVideoUseCase.ts`, `VideoQualityGate.ts`.
**Critérios de aceite**: conforme máquina de estados; `VideoProcessingFailed` emitido em falha definitiva; delay do job de publicação calculado corretamente.
**Critérios de teste**: unitário (dublês); integração ponta a ponta com binários reais, incluindo verificação do delay.
**Checklist**: [ ] timeout de 10 min aplicado.
**Dependências**: ISSUE-06.F4.S1.T1, ISSUE-06.F4.S1.T2, ISSUE-06.F4.S1.T3.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:worker`, `priority:P0`.
**Prioridade**: P0. **Complexidade**: Alta. **Tempo estimado**: 4 dias (8 pontos).

---

### ISSUE-06.F5.S1.T1 — Fila de moderação (admin)
**Descrição**: aprovação/rejeição de conteúdo sinalizado.
**Objetivo**: implementar RF-11 (rede de segurança de conteúdo sensível).
**Motivação**: é a proteção contra publicação automática de conteúdo impróprio sem revisão humana — a janela entre geração matinal e primeira publicação do dia dá tempo real para essa revisão.
**Arquivos envolvidos**: `apps/api/src/application/use-cases/content-generation/ReviewFlaggedVideoUseCase.ts`, controllers admin.
**Critérios de aceite**: conforme [api/admin-api.md](../../api/admin-api.md).
**Critérios de teste**: integração (aprovação segue pipeline corretamente).
**Checklist**: [ ] SLA de moderação monitorado.
**Dependências**: ISSUE-06.F3.S2.T3, EPIC-10.
**Labels**: `epic:EPIC-06`, `type:feature`, `layer:api`, `priority:P1`.
**Prioridade**: P1. **Complexidade**: Média. **Tempo estimado**: 2.5 dias (5 pontos).
