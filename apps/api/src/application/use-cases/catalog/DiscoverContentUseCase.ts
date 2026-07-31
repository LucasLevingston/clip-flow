import { AuditLog } from "../../../domain/audit/entities/AuditLog"
import type { AuditLogRepository } from "../../../domain/audit/repositories/AuditLogRepository"
import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import type { ContentSourceConfigRepository } from "../../../domain/catalog/repositories/ContentSourceConfigRepository"
import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import type { SourceVideoRepository } from "../../../domain/catalog/repositories/SourceVideoRepository"
import type { ContentSourceProviderRegistry } from "../../../domain/catalog/services/ContentSourceProviderRegistry"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"
import { ContentDiscoveryRunner } from "./ContentDiscoveryRunner"

export interface DiscoverContentInput {
  actorUserId: string
  nicheId: string
}

export interface DiscoverContentResult {
  discovered: number
  ingested: number
  skipped: number
  failedSources: Array<{ contentSourceConfigId: string; name: string; message: string }>
}

export interface DiscoverContentUseCaseDeps {
  nicheRepository: NicheRepository
  contentSourceConfigRepository: ContentSourceConfigRepository
  sourceVideoRepository: SourceVideoRepository
  providerRegistry: ContentSourceProviderRegistry
  auditLogRepository: AuditLogRepository
  idGenerator: IdGenerator
}

/**
 * `POST /v1/admin/niches/:id/content-sources/discover`. Runs every active ContentSourceConfig
 * for the niche and ingests new candidates as SourceVideo(PENDING_REVIEW) — never auto-approved,
 * an admin still reviews each one via the existing curation flow (ADR-0006).
 */
export class DiscoverContentUseCase {
  constructor(private readonly deps: DiscoverContentUseCaseDeps) {}

  async execute(input: DiscoverContentInput): Promise<DiscoverContentResult> {
    const niche = await this.deps.nicheRepository.findById(input.nicheId)
    if (!niche) {
      throw new NicheNotFoundError(input.nicheId)
    }

    const configs = await this.deps.contentSourceConfigRepository.findActiveByNiche(input.nicheId)
    const runner = new ContentDiscoveryRunner(this.deps)

    const result: DiscoverContentResult = {
      discovered: 0,
      ingested: 0,
      skipped: 0,
      failedSources: [],
    }
    for (const config of configs) {
      const outcome = await runner.run(config, input.nicheId)
      result.discovered += outcome.discovered
      result.ingested += outcome.ingested
      result.skipped += outcome.skipped
      if (outcome.failure) {
        result.failedSources.push(outcome.failure)
      }
    }

    await this.deps.auditLogRepository.save(
      AuditLog.create({
        id: this.deps.idGenerator.generate(),
        actorUserId: input.actorUserId,
        actorType: "PLATFORM_ADMIN",
        action: "content_source.discovery_run",
        targetType: "Niche",
        targetId: input.nicheId,
        metadata: { ...result },
      }),
    )

    return result
  }
}
