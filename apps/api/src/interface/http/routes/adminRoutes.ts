import type { FastifyInstance } from "fastify"
import type { IngestSourceVideoUseCase } from "../../../application/use-cases/catalog/IngestSourceVideoUseCase"
import type { ReviewSourceVideoUseCase } from "../../../application/use-cases/catalog/ReviewSourceVideoUseCase"
import type { ListModerationQueueUseCase } from "../../../application/use-cases/content-generation/ListModerationQueueUseCase"
import type { ReviewFlaggedVideoUseCase } from "../../../application/use-cases/content-generation/ReviewFlaggedVideoUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requirePlatformAdmin } from "../middlewares/requirePlatformAdmin"
import { createIngestSourceVideoHandler } from "./admin/ingestSourceVideoHandler"
import { createListModerationQueueHandler } from "./admin/listModerationQueueHandler"
import { createReviewFlaggedVideoHandler } from "./admin/reviewFlaggedVideoHandler"
import { createReviewSourceVideoHandler } from "./admin/reviewSourceVideoHandler"

export interface AdminRoutesDeps {
  ingestSourceVideoUseCase: IngestSourceVideoUseCase
  reviewSourceVideoUseCase: ReviewSourceVideoUseCase
  listModerationQueueUseCase: ListModerationQueueUseCase
  reviewFlaggedVideoUseCase: ReviewFlaggedVideoUseCase
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

  app.get(
    "/v1/admin/moderation-queue",
    { preHandler },
    createListModerationQueueHandler(deps.listModerationQueueUseCase),
  )

  app.patch<{ Params: { generatedVideoId: string } }>(
    "/v1/admin/moderation-queue/:generatedVideoId",
    { preHandler },
    createReviewFlaggedVideoHandler(deps.reviewFlaggedVideoUseCase),
  )
}
