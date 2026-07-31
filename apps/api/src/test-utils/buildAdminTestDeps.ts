import { CreateNicheUseCase } from "../application/use-cases/catalog/CreateNicheUseCase"
import { CreatePromptTemplateUseCase } from "../application/use-cases/catalog/CreatePromptTemplateUseCase"
import { IngestSourceVideoUseCase } from "../application/use-cases/catalog/IngestSourceVideoUseCase"
import { ListSourceVideosUseCase } from "../application/use-cases/catalog/ListSourceVideosUseCase"
import { ReviewSourceVideoUseCase } from "../application/use-cases/catalog/ReviewSourceVideoUseCase"
import { UpdateNicheUseCase } from "../application/use-cases/catalog/UpdateNicheUseCase"
import { ListModerationQueueUseCase } from "../application/use-cases/content-generation/ListModerationQueueUseCase"
import { ReviewFlaggedVideoUseCase } from "../application/use-cases/content-generation/ReviewFlaggedVideoUseCase"
import { GetPlatformHealthUseCase } from "../application/use-cases/health/GetPlatformHealthUseCase"
import { ListNichesAdminUseCase } from "../application/use-cases/catalog/ListNichesAdminUseCase"
import type { NicheRepository } from "../domain/catalog/repositories/NicheRepository"
import type { JwtService } from "../domain/identity/services/JwtService"
import { FakeIdGenerator } from "./fakes/FakeIdGenerator"
import { FakePromptTemplateRepository } from "./fakes/FakePromptTemplateRepository"
import { FakeVideoContentEventPublisher } from "./fakes/FakeVideoContentEventPublisher"
import { InMemoryAuditLogRepository } from "./fakes/InMemoryAuditLogRepository"
import { InMemoryGeneratedVideoRepository } from "./fakes/InMemoryGeneratedVideoRepository"
import { InMemoryPlatformHealthSnapshotRepository } from "./fakes/InMemoryPlatformHealthSnapshotRepository"
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
  const promptTemplateRepository = new FakePromptTemplateRepository()
  const platformHealthSnapshotRepository = new InMemoryPlatformHealthSnapshotRepository()
  const videoContentEventPublisher = new FakeVideoContentEventPublisher()

  return {
    sourceVideoRepository,
    auditLogRepository,
    generatedVideoRepository,
    promptTemplateRepository,
    platformHealthSnapshotRepository,
    videoContentEventPublisher,
    adminRoutesDeps: {
      createNicheUseCase: new CreateNicheUseCase({
        nicheRepository: input.nicheRepository,
        auditLogRepository,
        idGenerator: new FakeIdGenerator(),
      }),
      updateNicheUseCase: new UpdateNicheUseCase({
        nicheRepository: input.nicheRepository,
        auditLogRepository,
        idGenerator: new FakeIdGenerator(),
      }),
      listNichesAdminUseCase: new ListNichesAdminUseCase({
        nicheRepository: input.nicheRepository,
      }),
      createPromptTemplateUseCase: new CreatePromptTemplateUseCase({
        nicheRepository: input.nicheRepository,
        promptTemplateRepository,
        auditLogRepository,
        idGenerator: new FakeIdGenerator(),
      }),
      listSourceVideosUseCase: new ListSourceVideosUseCase({ sourceVideoRepository }),
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
      getPlatformHealthUseCase: new GetPlatformHealthUseCase({
        snapshotRepository: platformHealthSnapshotRepository,
      }),
      jwtService: input.jwtService,
    },
  }
}
