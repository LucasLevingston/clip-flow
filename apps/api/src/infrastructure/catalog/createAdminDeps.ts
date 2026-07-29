import { IngestSourceVideoUseCase } from "../../application/use-cases/catalog/IngestSourceVideoUseCase"
import { ReviewSourceVideoUseCase } from "../../application/use-cases/catalog/ReviewSourceVideoUseCase"
import type { NicheRepository } from "../../domain/catalog/repositories/NicheRepository"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { UuidGenerator } from "../auth/UuidGenerator"
import { AuditLogPrismaRepository } from "../repositories/AuditLogPrismaRepository"
import { SourceVideoPrismaRepository } from "../repositories/SourceVideoPrismaRepository"

export interface CreateAdminDepsInput {
  nicheRepository: NicheRepository
  jwtService: JwtService
}

/** Composition root helper — wires the real Prisma-backed admin curation flow. */
export function createAdminDeps(input: CreateAdminDepsInput) {
  const sourceVideoRepository = new SourceVideoPrismaRepository()
  const auditLogRepository = new AuditLogPrismaRepository()

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
    jwtService: input.jwtService,
  }
}
