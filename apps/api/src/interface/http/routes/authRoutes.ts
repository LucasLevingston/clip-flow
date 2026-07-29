import type { FastifyInstance } from "fastify"
import type { GetCurrentUserUseCase } from "../../../application/use-cases/identity/GetCurrentUserUseCase"
import type { LoginUseCase } from "../../../application/use-cases/identity/LoginUseCase"
import type { LogoutUseCase } from "../../../application/use-cases/identity/LogoutUseCase"
import type { RefreshAccessTokenUseCase } from "../../../application/use-cases/identity/RefreshAccessTokenUseCase"
import type { RegisterTenantUseCase } from "../../../application/use-cases/identity/RegisterTenantUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { createLoginHandler } from "./auth/loginHandler"
import { createLogoutHandler } from "./auth/logoutHandler"
import { createMeHandler } from "./auth/meHandler"
import { createRefreshHandler } from "./auth/refreshHandler"
import { createRegisterHandler } from "./auth/registerHandler"

export interface AuthRoutesDeps {
  registerTenantUseCase: RegisterTenantUseCase
  loginUseCase: LoginUseCase
  refreshAccessTokenUseCase: RefreshAccessTokenUseCase
  logoutUseCase: LogoutUseCase
  getCurrentUserUseCase: GetCurrentUserUseCase
  jwtService: JwtService
}

export function registerAuthRoutes(app: FastifyInstance, deps: AuthRoutesDeps): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)

  app.post("/v1/auth/register", createRegisterHandler(deps.registerTenantUseCase))
  app.post("/v1/auth/login", createLoginHandler(deps.loginUseCase))
  app.post("/v1/auth/refresh", createRefreshHandler(deps.refreshAccessTokenUseCase))
  app.post("/v1/auth/logout", createLogoutHandler(deps.logoutUseCase))
  app.get(
    "/v1/auth/me",
    { preHandler: authMiddleware },
    createMeHandler(deps.getCurrentUserUseCase),
  )
}
