import type { FastifyInstance } from "fastify"
import { AcceptInvitationUseCase } from "../application/use-cases/identity/AcceptInvitationUseCase"
import { GetCurrentUserUseCase } from "../application/use-cases/identity/GetCurrentUserUseCase"
import { InviteMemberUseCase } from "../application/use-cases/identity/InviteMemberUseCase"
import { LoginUseCase } from "../application/use-cases/identity/LoginUseCase"
import { LogoutUseCase } from "../application/use-cases/identity/LogoutUseCase"
import { RefreshAccessTokenUseCase } from "../application/use-cases/identity/RefreshAccessTokenUseCase"
import { RegisterTenantUseCase } from "../application/use-cases/identity/RegisterTenantUseCase"
import { buildServer } from "../interface/http/buildServer"
import { buildIdentityTestContext } from "./buildIdentityTestContext"

/** Wires a full Fastify instance against in-memory fakes — no real I/O. */
export function buildTestServer(): {
  app: FastifyInstance
  ctx: ReturnType<typeof buildIdentityTestContext>
} {
  const ctx = buildIdentityTestContext()

  const app = buildServer({
    auth: {
      registerTenantUseCase: new RegisterTenantUseCase(ctx),
      loginUseCase: new LoginUseCase(ctx),
      refreshAccessTokenUseCase: new RefreshAccessTokenUseCase(ctx),
      logoutUseCase: new LogoutUseCase(ctx),
      getCurrentUserUseCase: new GetCurrentUserUseCase(ctx),
      jwtService: ctx.jwtService,
    },
    members: {
      inviteMemberUseCase: new InviteMemberUseCase(ctx),
      acceptInvitationUseCase: new AcceptInvitationUseCase(ctx),
      jwtService: ctx.jwtService,
    },
  })

  return { app, ctx }
}
