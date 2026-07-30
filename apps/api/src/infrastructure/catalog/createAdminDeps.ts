import { IngestSourceVideoUseCase } from "../../application/use-cases/catalog/IngestSourceVideoUseCase"
import { ReviewSourceVideoUseCase } from "../../application/use-cases/catalog/ReviewSourceVideoUseCase"
import { ListModerationQueueUseCase } from "../../application/use-cases/content-generation/ListModerationQueueUseCase"
import { ReviewFlaggedVideoUseCase } from "../../application/use-cases/content-generation/ReviewFlaggedVideoUseCase"
import type { NicheRepository } from "../../domain/catalog/repositories/NicheRepository"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { UuidGenerator } from "../auth/UuidGenerator"
import { BullMqVideoContentEventPublisher } from "../queue/BullMqVideoContentEventPublisher"
import { AuditLogPrismaRepository } from "../repositories/AuditLogPrismaRepository"
import { GeneratedVideoPrismaRepository } from "../repositories/GeneratedVideoPrismaRepository"
import { SourceVideoPrismaRepository } from "../repositories/SourceVideoPrismaRepository"

export interface CreateAdminDepsInput {
  nicheRepository: NicheRepository
  jwtService: JwtService
}

/** Composition root helper — wires the real Prisma-backed admin curation + moderation flows. */
export function createAdminDeps(input: CreateAdminDepsInput) {
  const sourceVideoRepository = new SourceVideoPrismaRepository()
  const auditLogRepository = new AuditLogPrismaRepository()
  const generatedVideoRepository = new GeneratedVideoPrismaRepository()

  return {
    ingestSourceVideoUseCase: new IngestSourceVideoUseCase({
      nicheRepository: input.nicheRepository,
      sourceVideoRepository,
      auditLogRepository,
      idGenerator: new UuidGenerator(),
    }),
    reviewSourceVideoUseCase: new ReviewSourceVideoUseCase({
      sourceVideoRepository,
      auditLogRepository,
      idGenerator: new UuidGenerator(),
    }),
    listModerationQueueUseCase: new ListModerationQueueUseCase({ generatedVideoRepository }),
    reviewFlaggedVideoUseCase: new ReviewFlaggedVideoUseCase({
      generatedVideoRepository,
      videoContentEventPublisher: new BullMqVideoContentEventPublisher(),
      auditLogRepository,
      idGenerator: new UuidGenerator(),
    }),
    jwtService: input.jwtService,
  }
}
