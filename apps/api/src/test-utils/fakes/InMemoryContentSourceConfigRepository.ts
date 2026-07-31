import type { ContentSourceConfig } from "../../domain/catalog/entities/ContentSourceConfig"
import type { ContentSourceConfigRepository } from "../../domain/catalog/repositories/ContentSourceConfigRepository"

export class InMemoryContentSourceConfigRepository implements ContentSourceConfigRepository {
  private readonly configsById = new Map<string, ContentSourceConfig>()

  seed(config: ContentSourceConfig): void {
    this.configsById.set(config.id, config)
  }

  findActiveByNiche(nicheId: string): Promise<ContentSourceConfig[]> {
    return Promise.resolve(
      [...this.configsById.values()].filter(
        (config) => config.nicheId === nicheId && config.isActive,
      ),
    )
  }

  findByNiche(nicheId: string): Promise<ContentSourceConfig[]> {
    return Promise.resolve(
      [...this.configsById.values()].filter((config) => config.nicheId === nicheId),
    )
  }

  save(config: ContentSourceConfig): Promise<void> {
    this.configsById.set(config.id, config)
    return Promise.resolve()
  }
}
