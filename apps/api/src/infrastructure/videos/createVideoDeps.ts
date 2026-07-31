import { ExportVideosUseCase } from "../../application/use-cases/videos/ExportVideosUseCase"
import { GetVideoUseCase } from "../../application/use-cases/videos/GetVideoUseCase"
import { ListVideosUseCase } from "../../application/use-cases/videos/ListVideosUseCase"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { VideoPrismaRepository } from "../repositories/VideoPrismaRepository"

export interface CreateVideoDepsInput {
  jwtService: JwtService
}

/** Composition root helper — wires the real Prisma-backed videos bounded context. */
export function createVideoDeps(input: CreateVideoDepsInput) {
  const videoRepository = new VideoPrismaRepository()

  return {
    listVideosUseCase: new ListVideosUseCase({ videoRepository }),
    getVideoUseCase: new GetVideoUseCase({ videoRepository }),
    exportVideosUseCase: new ExportVideosUseCase({ videoRepository }),
    jwtService: input.jwtService,
  }
}
