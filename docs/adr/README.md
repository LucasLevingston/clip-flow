# Architecture Decision Records (ADR)

Índice de decisões arquiteturais do Clip Flow. Formato: Problema → Alternativas → Escolha → Consequências → Trade-offs. Status possíveis: `Proposto`, `Aceito`, `Substituído`, `Rejeitado`.

| ADR | Título | Status |
|---|---|---|
| [0001](0001-monorepo-vs-polyrepo.md) | Monorepo vs. Polyrepo | Aceito |
| [0002](0002-nextjs-frontend.md) | Next.js como frontend (App Router) | Aceito |
| [0003](0003-node-workers-bullmq.md) | Node.js + BullMQ para workers assíncronos | Aceito |
| [0004](0004-supabase-as-primary-db.md) | Supabase (Postgres) como banco primário | Aceito |
| [0005](0005-multi-tenant-strategy.md) | Estratégia multi-tenant (schema compartilhado + `tenant_id`) | Aceito |
| [0006](0006-content-source-strategy.md) | Estratégia de aquisição de conteúdo-fonte | Aceito |
| [0007](0007-deploy-target-vercel-railway.md) | Deploy: Vercel + Railway/Render | Aceito |
| [0008](0008-ai-provider-strategy-claude-openai.md) | Estratégia dual de provedores de IA (Claude + OpenAI) | Aceito |
| [0009](0009-video-processing-ffmpeg-opencv.md) | Processamento de vídeo: FFmpeg + OpenCV | Aceito |
| [0010](0010-queue-redis-bullmq.md) | Fila de jobs: Redis + BullMQ | Aceito |
| [0011](0011-channel-as-aggregate.md) | Channel como Aggregate Root central | Aceito |
| [0012](0012-batch-generation-delayed-publish.md) | Geração em lote diária + publicação em horários estratégicos | Aceito |
| [0013](0013-thumbnail-frame-extraction.md) | Thumbnail via extração de frame | Aceito |
| [0014](0014-learning-loop-prompt-augmentation.md) | Loop de aprendizado via aumento de contexto de prompt | Aceito |

Toda nova decisão estrutural (nova dependência de infraestrutura, mudança de padrão arquitetural, troca de provedor crítico) exige um novo ADR antes da implementação.
