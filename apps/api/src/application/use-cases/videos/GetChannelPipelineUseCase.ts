import type {
  VideoRepository,
  VideoSummary,
} from "../../../domain/videos/repositories/VideoRepository"

export interface GetChannelPipelineInput {
  tenantId: string
  channelId: string
}

export interface GetChannelPipelineUseCaseDeps {
  videoRepository: VideoRepository
}

/** `GET /v1/channels/:channelId/pipeline` — RF-13, tenant-facing real-time view of in-progress generation. */
export class GetChannelPipelineUseCase {
  constructor(private readonly deps: GetChannelPipelineUseCaseDeps) {}

  async execute(input: GetChannelPipelineInput): Promise<VideoSummary[]> {
    return this.deps.videoRepository.findActivePipelineByChannel(input.tenantId, input.channelId)
  }
}
