# ADR-0003 — Node.js + BullMQ para Workers Assíncronos

## Status
Aceito

## Problema
O pipeline de geração de vídeo (transcrição, IA, corte, upload, analytics) é assíncrono, longo (até 15 min — RNF-02) e propenso a falhas transitórias de integrações externas. É preciso um modelo de execução desacoplado da API síncrona.

## Alternativas
1. **Node.js + BullMQ (Redis)** — filas por domínio, workers Node dedicados, mesmo ecossistema de tipos do resto do monorepo.
2. **AWS SQS + Lambda** — serverless, gerenciado, mas exige AWS (contradiz [ADR-0007](0007-deploy-target-vercel-railway.md) no MVP).
3. **Celery (Python) + Redis** — forte no ecossistema de vídeo/IA em Python, mas introduz segunda linguagem no monorepo.

## Escolha
**Node.js + BullMQ sobre Redis**, com um worker process dedicado por domínio (Video, Scheduler, AI, Upload, Analytics, Notification, Health), todos consumindo filas nomeadas isoladas.

## Consequências
- Reaproveita tipos, schemas Zod e clientes de integração do mesmo monorepo TypeScript usado pela API e frontend.
- BullMQ fornece retry com backoff, dead-letter queue, prioridade e repetição agendada (cron-like) nativamente — atende RNF-32/RNF-35.
- Cada worker escala horizontalmente de forma independente (RNF-12/RNF-13), rodando como serviço separado no Railway/Render.
- FFmpeg/OpenCV são invocados via binding/CLI a partir do Video Worker Node — chamadas de processo são isoladas em serviço de infraestrutura (`VideoProcessingService`), nunca chamadas diretamente do domínio (DIP).

## Trade-offs
- Python (alternativa 3) tem ecossistema mais maduro para OpenCV/FFmpeg bindings, mas fragmentaria o time em duas linguagens — rejeitado para MVP; pode ser revisitado como microserviço isolado se processamento de vídeo se tornar gargalo.
- SQS+Lambda (alternativa 2) foi rejeitado por acoplar a plataforma à AWS, conflitando com a escolha de deploy gerenciado Vercel+Railway/Render e por Lambda ter limite de execução (15 min) próximo do próprio SLA do pipeline, deixando pouca margem.
