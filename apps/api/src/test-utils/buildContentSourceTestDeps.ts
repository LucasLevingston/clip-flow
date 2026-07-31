import { CreateContentSourceConfigUseCase } from "../application/use-cases/catalog/CreateContentSourceConfigUseCase"
import { DiscoverContentUseCase } from "../application/use-cases/catalog/DiscoverContentUseCase"
import { ListContentSourceConfigsUseCase } from "../application/use-cases/catalog/ListContentSourceConfigsUseCase"
import type { AuditLogRepository } from "../domain/audit/repositories/AuditLogRepository"
import type { NicheRepository } from "../domain/catalog/repositories/NicheRepository"
import type { SourceVideoRepository } from "../domain/catalog/repositories/SourceVideoRepository"
import { StaticContentSourceProviderRegistry } from "../infrastructure/catalog/providers/StaticContentSourceProviderRegistry"
import { FakeIdGenerator } from "./fakes/FakeIdGenerator"
import { InMemoryContentSourceConfigRepository } from "./fakes/InMemoryContentSourceConfigRepository"
import { StubContentSourceProvider } from "./fakes/StubContentSourceProvider"

export interface BuildContentSourceTestDepsInput {
  nicheRepository: NicheRepository
  sourceVideoRepository: SourceVideoRepository
  auditLogRepository: AuditLogRepository
}

/** Wires the ContentSourceConfig CRUD + discovery flow with in-memory fakes for `buildTestServer`. */
export function buildContentSourceTestDeps(input: BuildContentSourceTestDepsInput) {
  const contentSourceConfigRepository = new InMemoryContentSourceConfigRepository()
  const rssProvider = new StubContentSourceProvider("RSS_FEED")
  const localFolderProvider = new StubContentSourceProvider("LOCAL_FOLDER")
  const partnerApiProvider = new StubContentSourceProvider("PARTNER_API")
  const providerRegistry = new StaticContentSourceProviderRegistry([
    rssProvider,
    localFolderProvider,
    partnerApiProvider,
  ])

  return {
    contentSourceConfigRepository,
    rssProvider,
    localFolderProvider,
    partnerApiProvider,
    createContentSourceConfigUseCase: new CreateContentSourceConfigUseCase({
      nicheRepository: input.nicheRepository,
      contentSourceConfigRepository,
      auditLogRepository: input.auditLogRepository,
      idGenerator: new FakeIdGenerator(),
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
      idGenerator: new FakeIdGenerator(),
    }),
  }
}
