import type { ContentSourceConfig } from "../entities/ContentSourceConfig"
import type { ContentSourceProviderType } from "../types"

export interface DiscoveredContentCandidate {
  externalRef: string
  storageUrl: string
  durationSeconds: number
}

/** Strategy Pattern (ADR-0006) — one implementation per ContentSourceProviderType, never coupled to a specific platform in the domain layer. */
export interface ContentSourceProvider {
  readonly type: ContentSourceProviderType
  discover(config: ContentSourceConfig): Promise<DiscoveredContentCandidate[]>
}
