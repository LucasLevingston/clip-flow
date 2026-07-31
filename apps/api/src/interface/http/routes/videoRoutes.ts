import type { FastifyInstance } from "fastify"
import type { ExportVideosUseCase } from "../../../application/use-cases/videos/ExportVideosUseCase"
import type { GetVideoUseCase } from "../../../application/use-cases/videos/GetVideoUseCase"
import type { ListVideosUseCase } from "../../../application/use-cases/videos/ListVideosUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requireRole } from "../middlewares/requireRole"
import { createExportVideosHandler } from "./videos/exportVideosHandler"
import { createGetVideoHandler } from "./videos/getVideoHandler"
import { createListVideosHandler } from "./videos/listVideosHandler"

export interface VideoRoutesDeps {
  listVideosUseCase: ListVideosUseCase
  getVideoUseCase: GetVideoUseCase
  exportVideosUseCase: ExportVideosUseCase
  jwtService: JwtService
}

export function registerVideoRoutes(app: FastifyInstance, deps: VideoRoutesDeps): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)
  const requireOwnerOrAdmin = requireRole(["OWNER", "ADMIN"])

  app.get(
    "/v1/videos/export",
    { preHandler: [authMiddleware, requireOwnerOrAdmin] },
    createExportVideosHandler(deps.exportVideosUseCase),
  )

  app.get(
    "/v1/videos",
    { preHandler: authMiddleware },
    createListVideosHandler(deps.listVideosUseCase),
  )

  app.get<{ Params: { id: string } }>(
    "/v1/videos/:id",
    { preHandler: authMiddleware },
    createGetVideoHandler(deps.getVideoUseCase),
  )
}
