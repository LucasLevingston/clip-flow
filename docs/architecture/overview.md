# Arquitetura — Visão Geral

## Estilo arquitetural

Clip Flow é um monorepo com três tipos de artefato deployável, comunicando-se por API síncrona (HTTP) e por filas assíncronas (Redis/BullMQ):

1. **`apps/web`** — Next.js (App Router), frontend do tenant + páginas públicas.
2. **`apps/api`** — API HTTP (Node.js), fonte de verdade síncrona: autenticação, CRUD de domínio, orquestração de comandos.
3. **`apps/workers`** — 7 processos worker independentes (Video, Scheduler, AI, Upload, Analytics, Notification, Health), cada um consumindo sua fila dedicada.

Internamente, `apps/api` e cada worker seguem **Clean Architecture** (camadas: domain → application → infrastructure → interface), com Bounded Contexts explícitos (ver [domain/bounded-contexts.md](../domain/bounded-contexts.md)).

## Por que essa forma

- API síncrona não executa nenhum trabalho pesado (transcrição, corte de vídeo, chamadas de IA) — apenas enfileira comandos e responde rápido (RNF-01). Todo trabalho pesado é assíncrono via worker.
- Cada worker é escalável e substituível de forma independente (RNF-12), e uma falha em um domínio (ex.: Upload Worker fora do ar) não impacta os demais (RNF-16).
- Domínio (regras de negócio) nunca depende de infraestrutura (Prisma, FFmpeg, SDKs de IA, filas) — apenas de interfaces (DIP), permitindo testar 100% da lógica de negócio sem I/O real (RNF-30).

## Mapa de documentos de arquitetura

| Documento | Conteúdo |
|---|---|
| [c4-context.md](c4-context.md) | Sistema no contexto de usuários e sistemas externos |
| [c4-container.md](c4-container.md) | Containers internos (web, api, workers, db, redis) |
| [c4-component.md](c4-component.md) | Componentes internos da API e de um worker representativo |
| [c4-code.md](c4-code.md) | Nível de código: camadas Clean Architecture e exemplo de fluxo de classes |
| [event-flow.md](event-flow.md) | Eventos de domínio e quem os consome |
| [worker-flow.md](worker-flow.md) | Como os 7 workers se relacionam entre si |
| [scheduler-flow.md](scheduler-flow.md) | Disparo diário de geração em lote por canal |
| [ai-flow.md](ai-flow.md) | Transcrição → seleção de trecho → geração de copy |
| [upload-flow.md](upload-flow.md) | Publicação nas plataformas sociais |
| [analytics-flow.md](analytics-flow.md) | Coleta periódica de métricas pós-publicação |
