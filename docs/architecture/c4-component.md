# C4 — Nível 3: Componentes

## 3.1 Componentes da API HTTP

```mermaid
C4Component
title Clip Flow — Componentes da API HTTP

Container_Boundary(api, "API HTTP") {
  Component(httpLayer, "Interface HTTP", "Controllers/Route Handlers", "Recebe requisição, valida com Zod, chama Application Service")
  Component(authMiddleware, "Auth Middleware", "JWT + RBAC", "Autentica e autoriza toda rota protegida")
  Component(appServices, "Application Services", "Use Cases", "Orquestra regras de negócio, transações, eventos")
  Component(domainLayer, "Domain Layer", "Entities, VOs, Aggregates, Domain Services", "Regras de negócio puras, sem I/O")
  Component(repoInterfaces, "Repository Interfaces", "Portas de domínio", "Contratos abstratos de persistência")
  Component(repoImpl, "Repository Implementations", "Prisma", "Implementação concreta de acesso a dados")
  Component(queuePublisher, "Queue Publisher", "BullMQ Producer", "Enfileira jobs para os workers")
  Component(eventBus, "Domain Event Dispatcher", "In-process + BullMQ", "Publica eventos de domínio para consumidores internos e filas")
}

Rel(httpLayer, authMiddleware, "Passa por")
Rel(authMiddleware, appServices, "Invoca")
Rel(appServices, domainLayer, "Usa")
Rel(appServices, repoInterfaces, "Depende de (DIP)")
Rel(repoInterfaces, repoImpl, "Implementado por")
Rel(appServices, queuePublisher, "Enfileira comando assíncrono")
Rel(domainLayer, eventBus, "Emite evento de domínio")
Rel(eventBus, queuePublisher, "Publica evento em fila, se aplicável")
```

## 3.2 Componentes de um Worker (exemplo: AI Worker)

```mermaid
C4Component
title Clip Flow — Componentes do AI Worker

Container_Boundary(aiWorker, "AI Worker") {
  Component(queueConsumer, "Queue Consumer", "BullMQ Worker", "Recebe job da fila `ai`")
  Component(useCase, "GenerateVideoContentUseCase", "Application Service", "Orquestra transcrição + seleção + copy")
  Component(transcriptionPort, "TranscriptionProvider", "Interface de domínio", "Contrato para transcrição de áudio")
  Component(aiPort, "AiCompletionProvider", "Interface de domínio", "Contrato para IA generativa (ver ADR-0008)")
  Component(whisperAdapter, "WhisperAdapter", "Infraestrutura", "Implementa TranscriptionProvider via Whisper")
  Component(claudeAdapter, "ClaudeAdapter", "Infraestrutura", "Implementa AiCompletionProvider via Claude")
  Component(openAiAdapter, "OpenAiAdapter", "Infraestrutura", "Implementa AiCompletionProvider via OpenAI (fallback)")
  Component(repo, "GeneratedVideoRepository", "Infraestrutura (Prisma)", "Persiste resultado da etapa de IA")
  Component(nextQueue, "Queue Publisher", "BullMQ Producer", "Enfileira job para o Video Worker")
}

Rel(queueConsumer, useCase, "Invoca")
Rel(useCase, transcriptionPort, "Depende de (DIP)")
Rel(useCase, aiPort, "Depende de (DIP)")
Rel(transcriptionPort, whisperAdapter, "Implementado por")
Rel(aiPort, claudeAdapter, "Implementado por (primário)")
Rel(aiPort, openAiAdapter, "Implementado por (fallback)")
Rel(useCase, repo, "Persiste resultado")
Rel(useCase, nextQueue, "Enfileira próxima etapa (corte de vídeo)")
```

Todos os workers seguem o mesmo padrão de componentes: `Queue Consumer` → `Use Case` (Application Service) → `Domain`/`Ports` → `Adapters` de infraestrutura → `Queue Publisher` para a próxima etapa do pipeline (ver [event-flow.md](event-flow.md)).
