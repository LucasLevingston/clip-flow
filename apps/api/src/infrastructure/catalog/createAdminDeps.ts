import { CreateNicheUseCase } from "../../application/use-cases/catalog/CreateNicheUseCase"
import { CreatePromptTemplateUseCase } from "../../application/use-cases/catalog/CreatePromptTemplateUseCase"
import { IngestSourceVideoUseCase } from "../../application/use-cases/catalog/IngestSourceVideoUseCase"
import { ListSourceVideosUseCase } from "../../application/use-cases/catalog/ListSourceVideosUseCase"
import { ReviewSourceVideoUseCase } from "../../application/use-cases/catalog/ReviewSourceVideoUseCase"
import { UpdateNicheUseCase } from "../../application/use-cases/catalog/UpdateNicheUseCase"
import { ListModerationQueueUseCase } from "../../application/use-cases/content-generation/ListModerationQueueUseCase"
import { ReviewFlaggedVideoUseCase } from "../../application/use-cases/content-generation/ReviewFlaggedVideoUseCase"
import { GetPlatformHealthUseCase } from "../../application/use-cases/health/GetPlatformHealthUseCase"
import { ListNichesAdminUseCase } from "../../application/use-cases/catalog/ListNichesAdminUseCase"
import type { NicheRepository } from "../../domain/catalog/repositories/NicheRepository"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { UuidGenerator } from "../auth/UuidGenerator"
import { BullMqVideoContentEventPublisher } from "../queue/BullMqVideoContentEventPublisher"
import { AuditLogPrismaRepository } from "../repositories/AuditLogPrismaRepository"
import { GeneratedVideoPrismaRepository } from "../repositories/GeneratedVideoPrismaRepository"
import { PlatformHealthSnapshotPrismaRepository } from "../repositories/PlatformHealthSnapshotPrismaRepository"
import { PromptTemplatePrismaRepository } from "../repositories/PromptTemplatePrismaRepository"
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
  const promptTemplateRepository = new PromptTemplatePrismaRepository()
  const platformHealthSnapshotRepository = new PlatformHealthSnapshotPrismaRepository()

  return {
    createNicheUseCase: new CreateNicheUseCase({
      nicheRepository: input.nicheRepository,
      auditLogRepository,
      idGenerator: new UuidGenerator(),
    }),
    updateNicheUseCase: new UpdateNicheUseCase({
      nicheRepository: input.nicheRepository,
      auditLogRepository,
      idGenerator: new UuidGenerator(),
    }),
    listNichesAdminUseCase: new ListNichesAdminUseCase({ nicheRepository: input.nicheRepository }),
    createPromptTemplateUseCase: new CreatePromptTemplateUseCase({
      nicheRepository: input.nicheRepository,
      promptTemplateRepository,
      auditLogRepository,
      idGenerator: new UuidGenerator(),
    }),
    listSourceVideosUseCase: new ListSourceVideosUseCase({ sourceVideoRepository }),
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
    getPlatformHealthUseCase: new GetPlatformHealthUseCase({
      snapshotRepository: platformHealthSnapshotRepository,
    }),
    jwtService: input.jwtService,
  }
}
