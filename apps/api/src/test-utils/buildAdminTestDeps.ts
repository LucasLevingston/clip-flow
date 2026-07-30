import { IngestSourceVideoUseCase } from "../application/use-cases/catalog/IngestSourceVideoUseCase"
import { ReviewSourceVideoUseCase } from "../application/use-cases/catalog/ReviewSourceVideoUseCase"
import { ListModerationQueueUseCase } from "../application/use-cases/content-generation/ListModerationQueueUseCase"
import { ReviewFlaggedVideoUseCase } from "../application/use-cases/content-generation/ReviewFlaggedVideoUseCase"
import type { NicheRepository } from "../domain/catalog/repositories/NicheRepository"
import type { JwtService } from "../domain/identity/services/JwtService"
import { FakeIdGenerator } from "./fakes/FakeIdGenerator"
import { FakeVideoContentEventPublisher } from "./fakes/FakeVideoContentEventPublisher"
import { InMemoryAuditLogRepository } from "./fakes/InMemoryAuditLogRepository"
import { InMemoryGeneratedVideoRepository } from "./fakes/InMemoryGeneratedVideoRepository"
import { InMemorySourceVideoRepository } from "./fakes/InMemorySourceVideoRepository"

export interface BuildAdminTestDepsInput {
  nicheRepository: NicheRepository
  jwtService: JwtService
}

/** Wires the admin (platform curation + moderation) bounded context's use cases + fakes for `buildTestServer`. */
export function buildAdminTestDeps(input: BuildAdminTestDepsInput) {
  const sourceVideoRepository = new InMemorySourceVideoRepository()
  const auditLogRepository = new InMemoryAuditLogRepository()
  const generatedVideoRepository = new InMemoryGeneratedVideoRepository()
  const videoContentEventPublisher = new FakeVideoContentEventPublisher()

  return {
    sourceVideoRepository,
    auditLogRepository,
    generatedVideoRepository,
    videoContentEventPublisher,
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
      listModerationQueueUseCase: new ListModerationQueueUseCase({ generatedVideoRepository }),
      reviewFlaggedVideoUseCase: new ReviewFlaggedVideoUseCase({
        generatedVideoRepository,
        videoContentEventPublisher,
        auditLogRepository,
        idGenerator: new FakeIdGenerator(),
      }),
      jwtService: input.jwtService,
    },
  }
}
