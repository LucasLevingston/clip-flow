import type { ContentSourceConfig } from "../entities/ContentSourceConfig"

export interface ContentSourceConfigRepository {
  findActiveByNiche(nicheId: string): Promise<ContentSourceConfig[]>
  findByNiche(nicheId: string): Promise<ContentSourceConfig[]>
  save(contentSourceConfig: ContentSourceConfig): Promise<void>
}
