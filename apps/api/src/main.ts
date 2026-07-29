import { GetNicheUseCase } from "./application/use-cases/catalog/GetNicheUseCase"
import { ListNichesUseCase } from "./application/use-cases/catalog/ListNichesUseCase"
import { AcceptInvitationUseCase } from "./application/use-cases/identity/AcceptInvitationUseCase"
import { GetCurrentUserUseCase } from "./application/use-cases/identity/GetCurrentUserUseCase"
import { InviteMemberUseCase } from "./application/use-cases/identity/InviteMemberUseCase"
import { LoginUseCase } from "./application/use-cases/identity/LoginUseCase"
import { LogoutUseCase } from "./application/use-cases/identity/LogoutUseCase"
import { RefreshAccessTokenUseCase } from "./application/use-cases/identity/RefreshAccessTokenUseCase"
import { RegisterTenantUseCase } from "./application/use-cases/identity/RegisterTenantUseCase"
import { SessionIssuer } from "./application/services/SessionIssuer"
import { BcryptPasswordHasher } from "./infrastructure/auth/BcryptPasswordHasher"
import { JsonWebTokenService } from "./infrastructure/auth/JsonWebTokenService"
import { RandomSecureTokenGenerator } from "./infrastructure/auth/RandomSecureTokenGenerator"
import { Sha256RefreshTokenHasher } from "./infrastructure/auth/Sha256RefreshTokenHasher"
import { SystemClock } from "./infrastructure/auth/SystemClock"
import { UuidGenerator } from "./infrastructure/auth/UuidGenerator"
import { createBillingDeps } from "./infrastructure/billing/createBillingDeps"
import { createChannelManagementDeps } from "./infrastructure/channel-management/createChannelManagementDeps"
import { createSocialAccountDeps } from "./infrastructure/channel-management/createSocialAccountDeps"
import { InvitationPrismaRepository } from "./infrastructure/repositories/InvitationPrismaRepository"
import { MembershipPrismaRepository } from "./infrastructure/repositories/MembershipPrismaRepository"
import { NichePrismaRepository } from "./infrastructure/repositories/NichePrismaRepository"
import { RefreshTokenPrismaRepository } from "./infrastructure/repositories/RefreshTokenPrismaRepository"
import { SubscriptionPrismaRepository } from "./infrastructure/repositories/SubscriptionPrismaRepository"
import { TenantPrismaRepository } from "./infrastructure/repositories/TenantPrismaRepository"
import { UserPrismaRepository } from "./infrastructure/repositories/UserPrismaRepository"
import { buildServer } from "./interface/http/buildServer"

const jwtService = new JsonWebTokenService(
  process.env.JWT_PRIVATE_KEY ?? "",
  process.env.JWT_PUBLIC_KEY ?? "",
)
const refreshTokenRepository = new RefreshTokenPrismaRepository()
const sessionIssuer = new SessionIssuer({
  jwtService,
  refreshTokenRepository,
  refreshTokenHasher: new Sha256RefreshTokenHasher(),
  secureTokenGenerator: new RandomSecureTokenGenerator(),
  clock: new SystemClock(),
})

const userRepository = new UserPrismaRepository()
const subscriptionRepository = new SubscriptionPrismaRepository()

const identityDeps = {
  userRepository,
  tenantRepository: new TenantPrismaRepository(),
  membershipRepository: new MembershipPrismaRepository(),
  subscriptionRepository,
  refreshTokenRepository,
  invitationRepository: new InvitationPrismaRepository(),
  passwordHasher: new BcryptPasswordHasher(),
  refreshTokenHasher: new Sha256RefreshTokenHasher(),
  idGenerator: new UuidGenerator(),
  clock: new SystemClock(),
  sessionIssuer,
}

const catalogDeps = {
  nicheRepository: new NichePrismaRepository(),
}

const billing = createBillingDeps({ subscriptionRepository, userRepository, jwtService })
const channels = createChannelManagementDeps({
  nicheRepository: catalogDeps.nicheRepository,
  subscriptionRepository,
  planRepository: billing.planRepository,
  channelUsageProvider: billing.channelUsageProvider,
  jwtService,
})
const socialAccounts = createSocialAccountDeps({ jwtService })

const app = buildServer({
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
})

const port = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen({ port, host: "0.0.0.0" }).catch((error: unknown) => {
  app.log.error(error)
  process.exit(1)
})
