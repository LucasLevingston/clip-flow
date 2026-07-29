import type { FastifyInstance } from "fastify"
import type { ConnectSocialAccountUseCase } from "../../../application/use-cases/channel-management/ConnectSocialAccountUseCase"
import type { GetSocialAccountOAuthUrlUseCase } from "../../../application/use-cases/channel-management/GetSocialAccountOAuthUrlUseCase"
import type { ListSocialAccountsUseCase } from "../../../application/use-cases/channel-management/ListSocialAccountsUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requireRole } from "../middlewares/requireRole"
import { createGetOAuthUrlHandler } from "./socialAccounts/getOAuthUrlHandler"
import { createListSocialAccountsHandler } from "./socialAccounts/listSocialAccountsHandler"
import { createOAuthCallbackHandler } from "./socialAccounts/oauthCallbackHandler"

export interface SocialAccountRoutesDeps {
  listSocialAccountsUseCase: ListSocialAccountsUseCase
  getSocialAccountOAuthUrlUseCase: GetSocialAccountOAuthUrlUseCase
  connectSocialAccountUseCase: ConnectSocialAccountUseCase
  jwtService: JwtService
}

type ChannelParams = { Params: { channelId: string } }
type OAuthParams = { Params: { channelId: string; platform: string } }

export function registerSocialAccountRoutes(
  app: FastifyInstance,
  deps: SocialAccountRoutesDeps,
): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)
  const requireOwnerOrAdmin = requireRole(["OWNER", "ADMIN"])

  app.get<ChannelParams>(
    "/v1/channels/:channelId/social-accounts",
    { preHandler: [authMiddleware, requireOwnerOrAdmin] },
    createListSocialAccountsHandler(deps.listSocialAccountsUseCase),
  )

  app.get<OAuthParams>(
    "/v1/channels/:channelId/social-accounts/:platform/oauth-url",
    { preHandler: [authMiddleware, requireOwnerOrAdmin] },
    createGetOAuthUrlHandler(deps.getSocialAccountOAuthUrlUseCase),
  )

  app.post<OAuthParams>(
    "/v1/channels/:channelId/social-accounts/:platform/oauth-callback",
    { preHandler: [authMiddleware, requireOwnerOrAdmin] },
    createOAuthCallbackHandler(deps.connectSocialAccountUseCase),
  )
}
