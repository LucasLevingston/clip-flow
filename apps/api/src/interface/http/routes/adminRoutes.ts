import type { FastifyInstance } from "fastify"
import type { IngestSourceVideoUseCase } from "../../../application/use-cases/catalog/IngestSourceVideoUseCase"
import type { ReviewSourceVideoUseCase } from "../../../application/use-cases/catalog/ReviewSourceVideoUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requirePlatformAdmin } from "../middlewares/requirePlatformAdmin"
import { createIngestSourceVideoHandler } from "./admin/ingestSourceVideoHandler"
import { createReviewSourceVideoHandler } from "./admin/reviewSourceVideoHandler"

export interface AdminRoutesDeps {
  ingestSourceVideoUseCase: IngestSourceVideoUseCase
  reviewSourceVideoUseCase: ReviewSourceVideoUseCase
  jwtService: JwtService
}

export function registerAdminRoutes(app: FastifyInstance, deps: AdminRoutesDeps): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)
  const preHandler = [authMiddleware, requirePlatformAdmin]

  app.post(
    "/v1/admin/source-videos",
    { preHandler },
    createIngestSourceVideoHandler(deps.ingestSourceVideoUseCase),
  )

  app.patch<{ Params: { id: string } }>(
    "/v1/admin/source-videos/:id/review",
    { preHandler },
    createReviewSourceVideoHandler(deps.reviewSourceVideoUseCase),
  )
}
