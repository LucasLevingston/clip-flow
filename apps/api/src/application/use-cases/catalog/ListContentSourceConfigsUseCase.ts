import type { ContentSourceConfigRepository } from "../../../domain/catalog/repositories/ContentSourceConfigRepository"
import {
  mapContentSourceConfigToDto,
  type ContentSourceConfigDto,
} from "./mapContentSourceConfigToDto"

export interface ListContentSourceConfigsInput {
  nicheId: string
}

export interface ListContentSourceConfigsUseCaseDeps {
  contentSourceConfigRepository: ContentSourceConfigRepository
}

/** `GET /v1/admin/niches/:id/content-sources`. */
export class ListContentSourceConfigsUseCase {
  constructor(private readonly deps: ListContentSourceConfigsUseCaseDeps) {}

  async execute(input: ListContentSourceConfigsInput): Promise<ContentSourceConfigDto[]> {
    const configs = await this.deps.contentSourceConfigRepository.findByNiche(input.nicheId)
    return configs.map(mapContentSourceConfigToDto)
  }
}
