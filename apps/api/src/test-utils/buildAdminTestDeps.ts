import { IngestSourceVideoUseCase } from "../application/use-cases/catalog/IngestSourceVideoUseCase"
import { ReviewSourceVideoUseCase } from "../application/use-cases/catalog/ReviewSourceVideoUseCase"
import type { NicheRepository } from "../domain/catalog/repositories/NicheRepository"
import type { JwtService } from "../domain/identity/services/JwtService"
import { FakeIdGenerator } from "./fakes/FakeIdGenerator"
import { InMemoryAuditLogRepository } from "./fakes/InMemoryAuditLogRepository"
import { InMemorySourceVideoRepository } from "./fakes/InMemorySourceVideoRepository"

export interface BuildAdminTestDepsInput {
  nicheRepository: NicheRepository
  jwtService: JwtService
}

/** Wires the admin (platform curation) bounded context's use cases + fakes for `buildTestServer`. */
export function buildAdminTestDeps(input: BuildAdminTestDepsInput) {
  const sourceVideoRepository = new InMemorySourceVideoRepository()
  const auditLogRepository = new InMemoryAuditLogRepository()

  return {
    sourceVideoRepository,
    auditLogRepository,
    adminRoutesDeps: {
      ingestSourceVideoUseCase: new IngestSourceVideoUseCase({
        nicheRepository: input.nicheRepository,
        sourceVideoRepository,
        auditLogRepository,
        idGenerator: new FakeIdGenerator(),
      }),
      reviewSourceVideoUseCase: new ReviewSourceVideoUseCase({
        sourceVideoRepository,
        auditLogRepository,
        idGenerator: new FakeIdGenerator(),
      }),
      jwtService: input.jwtService,
    },
  }
}
