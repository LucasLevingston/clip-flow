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
import { InvitationPrismaRepository } from "./infrastructure/repositories/InvitationPrismaRepository"
import { MembershipPrismaRepository } from "./infrastructure/repositories/MembershipPrismaRepository"
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

const identityDeps = {
  userRepository: new UserPrismaRepository(),
  tenantRepository: new TenantPrismaRepository(),
  membershipRepository: new MembershipPrismaRepository(),
  subscriptionRepository: new SubscriptionPrismaRepository(),
  refreshTokenRepository,
  invitationRepository: new InvitationPrismaRepository(),
  passwordHasher: new BcryptPasswordHasher(),
  refreshTokenHasher: new Sha256RefreshTokenHasher(),
  idGenerator: new UuidGenerator(),
  clock: new SystemClock(),
  sessionIssuer,
}

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
})

const port = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen({ port, host: "0.0.0.0" }).catch((error: unknown) => {
  app.log.error(error)
  process.exit(1)
})
