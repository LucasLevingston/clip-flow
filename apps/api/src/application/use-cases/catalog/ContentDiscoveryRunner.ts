import { SourceVideo } from "../../../domain/catalog/entities/SourceVideo"
import type { ContentSourceConfig } from "../../../domain/catalog/entities/ContentSourceConfig"
import type { SourceVideoRepository } from "../../../domain/catalog/repositories/SourceVideoRepository"
import type { ContentSourceProviderRegistry } from "../../../domain/catalog/services/ContentSourceProviderRegistry"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"

export interface SourceDiscoveryOutcome {
  discovered: number
  ingested: number
  skipped: number
  failure: { contentSourceConfigId: string; name: string; message: string } | null
}

export interface ContentDiscoveryRunnerDeps {
  sourceVideoRepository: SourceVideoRepository
  providerRegistry: ContentSourceProviderRegistry
  idGenerator: IdGenerator
}

/** Runs a single ContentSourceConfig's provider and ingests new candidates as SourceVideo(PENDING_REVIEW), deduped by externalRef. */
export class ContentDiscoveryRunner {
  constructor(private readonly deps: ContentDiscoveryRunnerDeps) {}

  async run(config: ContentSourceConfig, nicheId: string): Promise<SourceDiscoveryOutcome> {
    try {
      const provider = this.deps.providerRegistry.resolve(config.providerType)
      const candidates = await provider.discover(config)

      let ingested = 0
      let skipped = 0
      for (const candidate of candidates) {
        const alreadyExists = await this.deps.sourceVideoRepository.existsByExternalRef(
          nicheId,
          candidate.externalRef,
        )
        if (alreadyExists) {
          skipped += 1
          continue
        }

        const sourceVideo = SourceVideo.create({
          id: this.deps.idGenerator.generate(),
          nicheId,
          durationSeconds: candidate.durationSeconds,
          license: config.license,
          storageUrl: candidate.storageUrl,
          externalRef: candidate.externalRef,
        })
        await this.deps.sourceVideoRepository.save(sourceVideo)
        ingested += 1
      }

      return { discovered: candidates.length, ingested, skipped, failure: null }
    } catch (error) {
      return {
        discovered: 0,
        ingested: 0,
        skipped: 0,
        failure: {
          contentSourceConfigId: config.id,
          name: config.name,
          message: error instanceof Error ? error.message : "Unknown discovery error",
        },
      }
    }
  }
}
