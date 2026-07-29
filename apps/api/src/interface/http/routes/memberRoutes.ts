import type { FastifyInstance } from "fastify"
import type { AcceptInvitationUseCase } from "../../../application/use-cases/identity/AcceptInvitationUseCase"
import type { InviteMemberUseCase } from "../../../application/use-cases/identity/InviteMemberUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requireRole } from "../middlewares/requireRole"
import { createAcceptInvitationHandler } from "./members/acceptInvitationHandler"
import { createInviteMemberHandler } from "./members/inviteMemberHandler"

export interface MemberRoutesDeps {
  inviteMemberUseCase: InviteMemberUseCase
  acceptInvitationUseCase: AcceptInvitationUseCase
  jwtService: JwtService
}

export function registerMemberRoutes(app: FastifyInstance, deps: MemberRoutesDeps): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)
  const requireOwnerOrAdmin = requireRole(["OWNER", "ADMIN"])

  app.post(
    "/v1/members/invite",
    { preHandler: [authMiddleware, requireOwnerOrAdmin] },
    createInviteMemberHandler(deps.inviteMemberUseCase),
  )

  app.post(
    "/v1/members/invitations/accept",
    { preHandler: authMiddleware },
    createAcceptInvitationHandler(deps.acceptInvitationUseCase),
  )
}
