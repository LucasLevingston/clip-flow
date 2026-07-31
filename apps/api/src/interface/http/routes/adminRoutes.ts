import type { FastifyInstance } from "fastify"
import type { CreateNicheUseCase } from "../../../application/use-cases/catalog/CreateNicheUseCase"
import type { CreatePromptTemplateUseCase } from "../../../application/use-cases/catalog/CreatePromptTemplateUseCase"
import type { UpdateNicheUseCase } from "../../../application/use-cases/catalog/UpdateNicheUseCase"
import type { ListModerationQueueUseCase } from "../../../application/use-cases/content-generation/ListModerationQueueUseCase"
import type { ReviewFlaggedVideoUseCase } from "../../../application/use-cases/content-generation/ReviewFlaggedVideoUseCase"
import type { GetPlatformHealthUseCase } from "../../../application/use-cases/health/GetPlatformHealthUseCase"
import type { ListNichesAdminUseCase } from "../../../application/use-cases/catalog/ListNichesAdminUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requirePlatformAdmin } from "../middlewares/requirePlatformAdmin"
import { createCreateNicheHandler } from "./admin/createNicheHandler"
import { createCreatePromptTemplateHandler } from "./admin/createPromptTemplateHandler"
import { createGetPlatformHealthHandler } from "./admin/getPlatformHealthHandler"
import { createListModerationQueueHandler } from "./admin/listModerationQueueHandler"
import { createListNichesAdminHandler } from "./admin/listNichesAdminHandler"
import {
  registerContentSourceRoutes,
  type ContentSourceRoutesDeps,
} from "./admin/registerContentSourceRoutes"
import {
  registerSourceVideoRoutes,
  type SourceVideoRoutesDeps,
} from "./admin/registerSourceVideoRoutes"
import { createReviewFlaggedVideoHandler } from "./admin/reviewFlaggedVideoHandler"
import { createUpdateNicheHandler } from "./admin/updateNicheHandler"

export interface AdminRoutesDeps extends ContentSourceRoutesDeps, SourceVideoRoutesDeps {
  createNicheUseCase: CreateNicheUseCase
  updateNicheUseCase: UpdateNicheUseCase
  listNichesAdminUseCase: ListNichesAdminUseCase
  createPromptTemplateUseCase: CreatePromptTemplateUseCase
  listModerationQueueUseCase: ListModerationQueueUseCase
  reviewFlaggedVideoUseCase: ReviewFlaggedVideoUseCase
  getPlatformHealthUseCase: GetPlatformHealthUseCase
  jwtService: JwtService
}

export function registerAdminRoutes(app: FastifyInstance, deps: AdminRoutesDeps): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)
  const preHandler = [authMiddleware, requirePlatformAdmin]

  app.post("/v1/admin/niches", { preHandler }, createCreateNicheHandler(deps.createNicheUseCase))

  app.get(
    "/v1/admin/niches",
    { preHandler },
    createListNichesAdminHandler(deps.listNichesAdminUseCase),
  )

  app.patch<{ Params: { id: string } }>(
    "/v1/admin/niches/:id",
    { preHandler },
    createUpdateNicheHandler(deps.updateNicheUseCase),
  )

  app.post<{ Params: { id: string } }>(
    "/v1/admin/niches/:id/prompt-templates",
    { preHandler },
    createCreatePromptTemplateHandler(deps.createPromptTemplateUseCase),
  )

  registerSourceVideoRoutes(app, deps, preHandler)
  registerContentSourceRoutes(app, deps, preHandler)

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

  app.get(
    "/v1/admin/health",
    { preHandler },
    createGetPlatformHealthHandler(deps.getPlatformHealthUseCase),
  )
}
