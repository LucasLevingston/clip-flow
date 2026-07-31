import { buildVideosCsv } from "./buildVideosCsv"
import type {
  VideoFilters,
  VideoRepository,
} from "../../../domain/videos/repositories/VideoRepository"

export interface ExportVideosInput {
  tenantId: string
  filters: VideoFilters
}

export interface ExportVideosUseCaseDeps {
  videoRepository: VideoRepository
}

/** `GET /v1/videos/export` — see docs/api/videos-api.md. */
export class ExportVideosUseCase {
  constructor(private readonly deps: ExportVideosUseCaseDeps) {}

  async execute(input: ExportVideosInput): Promise<string> {
    const rows = await this.deps.videoRepository.findExportRows(input.tenantId, input.filters)
    return buildVideosCsv(rows)
  }
}
