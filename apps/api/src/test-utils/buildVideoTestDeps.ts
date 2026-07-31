import { ExportVideosUseCase } from "../application/use-cases/videos/ExportVideosUseCase"
import { GetChannelPipelineUseCase } from "../application/use-cases/videos/GetChannelPipelineUseCase"
import { GetVideoUseCase } from "../application/use-cases/videos/GetVideoUseCase"
import { ListVideosUseCase } from "../application/use-cases/videos/ListVideosUseCase"
import type { JwtService } from "../domain/identity/services/JwtService"
import { FakeVideoRepository } from "./fakes/FakeVideoRepository"

export interface BuildVideoTestDepsInput {
  jwtService: JwtService
}

/** Wires the videos bounded context's use cases + fakes for `buildTestServer`. */
export function buildVideoTestDeps(input: BuildVideoTestDepsInput) {
  const videoRepository = new FakeVideoRepository()

  return {
    videoRepository,
    videoRoutesDeps: {
      listVideosUseCase: new ListVideosUseCase({ videoRepository }),
      getVideoUseCase: new GetVideoUseCase({ videoRepository }),
      exportVideosUseCase: new ExportVideosUseCase({ videoRepository }),
      getChannelPipelineUseCase: new GetChannelPipelineUseCase({ videoRepository }),
      jwtService: input.jwtService,
    },
  }
}
