# C4 — Nível 2: Containers

```mermaid
C4Container
title Clip Flow — Diagrama de Containers

Person(tenantUser, "Usuário do Tenant")
Person(platformAdmin, "Administrador da Plataforma")

System_Boundary(clipFlow, "Clip Flow") {
  Container(web, "Web App", "Next.js 14 (App Router)", "Dashboard do tenant, admin console, páginas públicas")
  Container(api, "API HTTP", "Node.js / Express-Fastify + TypeScript", "Autenticação, CRUD de domínio, orquestração de comandos")
  Container(schedulerWorker, "Scheduler Worker", "Node.js + BullMQ", "Dispara lotes de geração diários por canal")
  Container(aiWorker, "AI Worker", "Node.js + BullMQ", "Transcrição, seleção de trecho, geração de copy")
  Container(videoWorker, "Video Worker", "Node.js + FFmpeg + OpenCV", "Corte, reenquadramento, legenda")
  Container(uploadWorker, "Upload Worker", "Node.js + BullMQ", "Publicação nas plataformas sociais")
  Container(analyticsWorker, "Analytics Worker", "Node.js + BullMQ", "Coleta métricas pós-publicação")
  Container(notificationWorker, "Notification Worker", "Node.js + BullMQ", "Envia notificações in-app/e-mail")
  Container(healthWorker, "Health Worker", "Node.js + BullMQ", "Monitora filas, workers e integrações")
  ContainerDb(db, "Banco Primário", "Supabase Postgres", "Dados de domínio: tenants, nichos, vídeos, assinaturas")
  ContainerDb(redis, "Fila / Cache", "Redis (BullMQ)", "Filas de job por domínio e cache de curto prazo")
  Container(storage, "Object Storage", "Supabase Storage", "Vídeos-fonte e vídeos gerados")
}

Rel(tenantUser, web, "Usa", "HTTPS")
Rel(platformAdmin, web, "Usa admin console", "HTTPS")
Rel(web, api, "Chama", "HTTPS/JSON, JWT")

Rel(api, db, "Lê/escreve", "Prisma/SQL")
Rel(api, redis, "Enfileira comandos assíncronos", "BullMQ")

Rel(schedulerWorker, redis, "Consome/produz jobs", "BullMQ")
Rel(aiWorker, redis, "Consome/produz jobs", "BullMQ")
Rel(videoWorker, redis, "Consome/produz jobs", "BullMQ")
Rel(uploadWorker, redis, "Consome/produz jobs", "BullMQ")
Rel(analyticsWorker, redis, "Consome/produz jobs", "BullMQ")
Rel(notificationWorker, redis, "Consome jobs", "BullMQ")
Rel(healthWorker, redis, "Monitora filas", "BullMQ")

Rel(schedulerWorker, db, "Lê agenda/assinaturas", "Prisma/SQL")
Rel(aiWorker, db, "Lê/escreve transcrição, GeneratedVideo", "Prisma/SQL")
Rel(aiWorker, storage, "Lê vídeo-fonte", "SDK")
Rel(videoWorker, storage, "Lê/escreve artefatos de vídeo", "SDK")
Rel(uploadWorker, db, "Escreve PublishRecord", "Prisma/SQL")
Rel(analyticsWorker, db, "Escreve métricas", "Prisma/SQL")
Rel(notificationWorker, db, "Lê preferências/escreve notificação", "Prisma/SQL")
Rel(healthWorker, db, "Escreve status de saúde", "Prisma/SQL")
```

## Containers e responsabilidades

| Container | Responsabilidade | Escala |
|---|---|---|
| Web App | UI do tenant, admin console, páginas públicas | Vercel (edge/serverless) |
| API HTTP | Único ponto de entrada síncrono; nunca executa trabalho pesado | Railway/Render, múltiplas réplicas |
| 7 Workers | Cada um consome exatamente uma fila nomeada; escalam independentemente | Railway/Render, réplicas por fila |
| Banco Primário | Fonte de verdade transacional | Supabase Postgres gerenciado |
| Fila/Cache | Comunicação assíncrona + cache de curto prazo (ex.: transcrição) | Redis gerenciado |
| Object Storage | Armazenamento de vídeo-fonte e vídeo gerado | Supabase Storage |

Nenhum worker expõe porta HTTP pública — todos são processos consumidores de fila, sem superfície de ataque de rede além de saída para integrações externas.
