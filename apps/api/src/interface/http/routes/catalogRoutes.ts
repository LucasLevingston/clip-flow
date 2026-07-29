import type { FastifyInstance } from "fastify"
import type { GetNicheUseCase } from "../../../application/use-cases/catalog/GetNicheUseCase"
import type { ListNichesUseCase } from "../../../application/use-cases/catalog/ListNichesUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { createGetNicheHandler } from "./catalog/getNicheHandler"
import { createListNichesHandler } from "./catalog/listNichesHandler"

export interface CatalogRoutesDeps {
  listNichesUseCase: ListNichesUseCase
  getNicheUseCase: GetNicheUseCase
  jwtService: JwtService
}

export function registerCatalogRoutes(app: FastifyInstance, deps: CatalogRoutesDeps): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)

  app.get(
    "/v1/niches",
    { preHandler: authMiddleware },
    createListNichesHandler(deps.listNichesUseCase),
  )
  app.get<{ Params: { nicheId: string } }>(
    "/v1/niches/:nicheId",
    { preHandler: authMiddleware },
    createGetNicheHandler(deps.getNicheUseCase),
  )
}
