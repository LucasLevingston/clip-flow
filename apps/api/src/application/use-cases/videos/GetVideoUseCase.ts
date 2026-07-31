import { VideoNotFoundError } from "../../../domain/videos/errors/VideoNotFoundError"
import type {
  VideoDetail,
  VideoRepository,
} from "../../../domain/videos/repositories/VideoRepository"

export interface GetVideoInput {
  tenantId: string
  videoId: string
}

export interface GetVideoUseCaseDeps {
  videoRepository: VideoRepository
}

/** `GET /v1/videos/:id` — see docs/api/videos-api.md. */
export class GetVideoUseCase {
  constructor(private readonly deps: GetVideoUseCaseDeps) {}

  async execute(input: GetVideoInput): Promise<VideoDetail> {
    const video = await this.deps.videoRepository.findById(input.tenantId, input.videoId)
    if (!video) {
      throw new VideoNotFoundError(input.videoId)
    }
    return video
  }
}
