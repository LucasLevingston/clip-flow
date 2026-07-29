import type { FastifyInstance } from "fastify"
import type { ChangePlanUseCase } from "../../../application/use-cases/billing/ChangePlanUseCase"
import type { GetPlansUseCase } from "../../../application/use-cases/billing/GetPlansUseCase"
import type { GetSubscriptionUseCase } from "../../../application/use-cases/billing/GetSubscriptionUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requireRole } from "../middlewares/requireRole"
import { createChangePlanHandler } from "./subscription/changePlanHandler"
import { createGetPlansHandler } from "./subscription/getPlansHandler"
import { createGetSubscriptionHandler } from "./subscription/getSubscriptionHandler"

export interface SubscriptionRoutesDeps {
  getPlansUseCase: GetPlansUseCase
  getSubscriptionUseCase: GetSubscriptionUseCase
  changePlanUseCase: ChangePlanUseCase
  jwtService: JwtService
}

export function registerSubscriptionRoutes(
  app: FastifyInstance,
  deps: SubscriptionRoutesDeps,
): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)
  const requireOwnerOrAdmin = requireRole(["OWNER", "ADMIN"])
  const requireOwner = requireRole(["OWNER"])

  app.get("/v1/plans", createGetPlansHandler(deps.getPlansUseCase))

  app.get(
    "/v1/subscription",
    { preHandler: [authMiddleware, requireOwnerOrAdmin] },
    createGetSubscriptionHandler(deps.getSubscriptionUseCase),
  )

  app.post(
    "/v1/subscription/change-plan",
    { preHandler: [authMiddleware, requireOwner] },
    createChangePlanHandler(deps.changePlanUseCase),
  )
}
