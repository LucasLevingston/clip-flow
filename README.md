# Clip Flow

SaaS multi-tenant de automação de criação e publicação de vídeos curtos por nicho: o usuário assina um nicho pré-definido, conecta suas contas do YouTube e TikTok, e o sistema produz e publica cortes automaticamente, todos os dias, sem intervenção manual.

## Status do projeto

**Fase 0 — Planejamento.** Nenhuma implementação foi iniciada ainda. Toda a engenharia de software (visão, requisitos, arquitetura, modelagem de domínio, banco de dados, APIs, workers, integrações, segurança, testes, backlog e roadmap) está documentada em [`docs/`](docs/README.md) e deve ser lida antes de qualquer contribuição de código.

## Começando

- Visão do produto: [docs/product/vision.md](docs/product/vision.md)
- Arquitetura: [docs/architecture/overview.md](docs/architecture/overview.md)
- Como contribuir: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
- Ambiente de desenvolvimento: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- Backlog e roadmap: [docs/backlog/README.md](docs/backlog/README.md) · [docs/roadmap/roadmap.md](docs/roadmap/roadmap.md)

## Stack

Next.js 14+ (App Router) · TypeScript strict · Zod · TanStack Query v5 · shadcn/ui · Zustand · Node.js + BullMQ/Redis (workers) · Supabase (Postgres + Storage) · FFmpeg + OpenCV (processamento de vídeo) · Claude + OpenAI (IA) · Whisper (transcrição) · Stripe (billing). Decisões e trade-offs completos em [docs/adr/](docs/adr/README.md).

Documentação completa: [`docs/README.md`](docs/README.md).
