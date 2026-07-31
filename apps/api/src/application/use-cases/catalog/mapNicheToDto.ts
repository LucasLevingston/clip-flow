import type { Niche } from "../../../domain/catalog/entities/Niche"
import type { NicheStatus } from "../../../domain/catalog/entities/Niche"

export interface NicheDto {
  id: string
  name: string
  slug: string
  description: string
  category: string
  previewThumbnailUrl: string | null
  status: NicheStatus
  createdAt: Date
}

export function mapNicheToDto(niche: Niche): NicheDto {
  return {
    id: niche.id,
    name: niche.name,
    slug: niche.slug,
    description: niche.description,
    category: niche.category,
    previewThumbnailUrl: niche.previewThumbnailUrl,
    status: niche.status,
    createdAt: niche.createdAt,
  }
}
