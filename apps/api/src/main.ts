import { GetNicheUseCase } from "./application/use-cases/catalog/GetNicheUseCase"
import { ListNichesUseCase } from "./application/use-cases/catalog/ListNichesUseCase"
import { AcceptInvitationUseCase } from "./application/use-cases/identity/AcceptInvitationUseCase"
import { GetCurrentUserUseCase } from "./application/use-cases/identity/GetCurrentUserUseCase"
import { InviteMemberUseCase } from "./application/use-cases/identity/InviteMemberUseCase"
import { LoginUseCase } from "./application/use-cases/identity/LoginUseCase"
import { LogoutUseCase } from "./application/use-cases/identity/LogoutUseCase"
import { RefreshAccessTokenUseCase } from "./application/use-cases/identity/RefreshAccessTokenUseCase"
import { RegisterTenantUseCase } from "./application/use-cases/identity/RegisterTenantUseCase"
import { createAnalyticsDeps } from "./infrastructure/analytics/createAnalyticsDeps"
import { createBillingDeps } from "./infrastructure/billing/createBillingDeps"
import { createChannelManagementDeps } from "./infrastructure/channel-management/createChannelManagementDeps"
import { createSocialAccountDeps } from "./infrastructure/channel-management/createSocialAccountDeps"
import { createAdminDeps } from "./infrastructure/catalog/createAdminDeps"
import { createIdentityDeps } from "./infrastructure/identity/createIdentityDeps"
import { createNotificationDeps } from "./infrastructure/notifications/createNotificationDeps"
import { NichePrismaRepository } from "./infrastructure/repositories/NichePrismaRepository"
import { createVideoDeps } from "./infrastructure/videos/createVideoDeps"
import { buildServer } from "./interface/http/buildServer"

const { jwtService, userRepository, subscriptionRepository, identityDeps } = createIdentityDeps()

const catalogDeps = {
  nicheRepository: new NichePrismaRepository(),
}

const billing = createBillingDeps({
  subscriptionRepository,
  userRepository,
  jwtService,
})
const channels = createChannelManagementDeps({
  nicheRepository: catalogDeps.nicheRepository,
  subscriptionRepository,
  planRepository: billing.planRepository,
  channelUsageProvider: billing.channelUsageProvider,
  jwtService,
})
const socialAccounts = createSocialAccountDeps({ jwtService })
const admin = createAdminDeps({ nicheRepository: catalogDeps.nicheRepository, jwtService })
const notifications = createNotificationDeps({ jwtService })
const videos = createVideoDeps({ jwtService })
const analytics = createAnalyticsDeps({ jwtService })

const app = buildServer({
  admin,
  auth: {
    registerTenantUseCase: new RegisterTenantUseCase(identityDeps),
    loginUseCase: new LoginUseCase(identityDeps),
    refreshAccessTokenUseCase: new RefreshAccessTokenUseCase(identityDeps),
    logoutUseCase: new LogoutUseCase(identityDeps),
    getCurrentUserUseCase: new GetCurrentUserUseCase(identityDeps),
    jwtService,
  },
  members: {
    inviteMemberUseCase: new InviteMemberUseCase(identityDeps),
    acceptInvitationUseCase: new AcceptInvitationUseCase(identityDeps),
    jwtService,
  },
  catalog: {
    listNichesUseCase: new ListNichesUseCase(catalogDeps),
    getNicheUseCase: new GetNicheUseCase(catalogDeps),
    jwtService,
  },
  subscription: billing.subscription,
  billing: billing.billing,
  channels,
  socialAccounts,
  notifications,
  videos,
  analytics,
})

const port = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen({ port, host: "0.0.0.0" }).catch((error: unknown) => {
  app.log.error(error)
  process.exit(1)
})
