import { GetNicheUseCase } from "../application/use-cases/catalog/GetNicheUseCase"
import { ListNichesUseCase } from "../application/use-cases/catalog/ListNichesUseCase"
import { AcceptInvitationUseCase } from "../application/use-cases/identity/AcceptInvitationUseCase"
import { GetCurrentUserUseCase } from "../application/use-cases/identity/GetCurrentUserUseCase"
import { InviteMemberUseCase } from "../application/use-cases/identity/InviteMemberUseCase"
import { LoginUseCase } from "../application/use-cases/identity/LoginUseCase"
import { LogoutUseCase } from "../application/use-cases/identity/LogoutUseCase"
import { RefreshAccessTokenUseCase } from "../application/use-cases/identity/RefreshAccessTokenUseCase"
import { RegisterTenantUseCase } from "../application/use-cases/identity/RegisterTenantUseCase"
import { buildServer } from "../interface/http/buildServer"
import { buildBillingTestDeps } from "./buildBillingTestDeps"
import { buildIdentityTestContext } from "./buildIdentityTestContext"
import { InMemoryNicheRepository } from "./fakes/InMemoryNicheRepository"

/** Wires a full Fastify instance against in-memory fakes — no real I/O. */
export function buildTestServer() {
  const ctx = buildIdentityTestContext()
  const nicheRepository = new InMemoryNicheRepository()
  const billing = buildBillingTestDeps({
    subscriptionRepository: ctx.subscriptionRepository,
    userRepository: ctx.userRepository,
    jwtService: ctx.jwtService,
  })

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
    catalog: {
      listNichesUseCase: new ListNichesUseCase({ nicheRepository }),
      getNicheUseCase: new GetNicheUseCase({ nicheRepository }),
      jwtService: ctx.jwtService,
    },
    subscription: billing.serverDeps.subscription,
    billing: billing.serverDeps.billing,
  })

  return {
    app,
    ctx,
    nicheRepository,
    planRepository: billing.planRepository,
    channelUsageProvider: billing.channelUsageProvider,
    checkoutSessionProvider: billing.checkoutSessionProvider,
  }
}
