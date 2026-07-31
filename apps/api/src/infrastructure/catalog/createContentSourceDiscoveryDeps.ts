import { CreateContentSourceConfigUseCase } from "../../application/use-cases/catalog/CreateContentSourceConfigUseCase"
import { DiscoverContentUseCase } from "../../application/use-cases/catalog/DiscoverContentUseCase"
import { ListContentSourceConfigsUseCase } from "../../application/use-cases/catalog/ListContentSourceConfigsUseCase"
import type { AuditLogRepository } from "../../domain/audit/repositories/AuditLogRepository"
import type { NicheRepository } from "../../domain/catalog/repositories/NicheRepository"
import type { SourceVideoRepository } from "../../domain/catalog/repositories/SourceVideoRepository"
import { UuidGenerator } from "../auth/UuidGenerator"
import { LocalFolderContentSourceProvider } from "./providers/LocalFolderContentSourceProvider"
import { PartnerApiContentSourceProvider } from "./providers/PartnerApiContentSourceProvider"
import { RssContentSourceProvider } from "./providers/RssContentSourceProvider"
import { StaticContentSourceProviderRegistry } from "./providers/StaticContentSourceProviderRegistry"
import { ContentSourceConfigPrismaRepository } from "../repositories/ContentSourceConfigPrismaRepository"

export interface CreateContentSourceDiscoveryDepsInput {
  nicheRepository: NicheRepository
  sourceVideoRepository: SourceVideoRepository
  auditLogRepository: AuditLogRepository
}

/** Composition root helper (ADR-0006) — wires the ContentSourceConfig CRUD + discovery flow. */
export function createContentSourceDiscoveryDeps(input: CreateContentSourceDiscoveryDepsInput) {
  const contentSourceConfigRepository = new ContentSourceConfigPrismaRepository()
  const providerRegistry = new StaticContentSourceProviderRegistry([
    new RssContentSourceProvider(),
    new LocalFolderContentSourceProvider(),
    new PartnerApiContentSourceProvider(),
  ])

  return {
    contentSourceConfigRepository,
    createContentSourceConfigUseCase: new CreateContentSourceConfigUseCase({
      nicheRepository: input.nicheRepository,
      contentSourceConfigRepository,
      auditLogRepository: input.auditLogRepository,
      idGenerator: new UuidGenerator(),
    }),
    listContentSourceConfigsUseCase: new ListContentSourceConfigsUseCase({
      contentSourceConfigRepository,
    }),
    discoverContentUseCase: new DiscoverContentUseCase({
      nicheRepository: input.nicheRepository,
      contentSourceConfigRepository,
      sourceVideoRepository: input.sourceVideoRepository,
      providerRegistry,
      auditLogRepository: input.auditLogRepository,
      idGenerator: new UuidGenerator(),
    }),
  }
}
