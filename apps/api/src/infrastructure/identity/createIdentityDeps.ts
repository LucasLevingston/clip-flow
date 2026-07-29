import { SessionIssuer } from "../../application/services/SessionIssuer"
import { BcryptPasswordHasher } from "../auth/BcryptPasswordHasher"
import { JsonWebTokenService } from "../auth/JsonWebTokenService"
import { RandomSecureTokenGenerator } from "../auth/RandomSecureTokenGenerator"
import { Sha256RefreshTokenHasher } from "../auth/Sha256RefreshTokenHasher"
import { SystemClock } from "../auth/SystemClock"
import { UuidGenerator } from "../auth/UuidGenerator"
import { InvitationPrismaRepository } from "../repositories/InvitationPrismaRepository"
import { MembershipPrismaRepository } from "../repositories/MembershipPrismaRepository"
import { RefreshTokenPrismaRepository } from "../repositories/RefreshTokenPrismaRepository"
import { SubscriptionPrismaRepository } from "../repositories/SubscriptionPrismaRepository"
import { TenantPrismaRepository } from "../repositories/TenantPrismaRepository"
import { UserPrismaRepository } from "../repositories/UserPrismaRepository"

/** Composition root helper — wires the real Prisma-backed identity bounded context for main.ts. */
export function createIdentityDeps() {
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

  return {
    jwtService,
    userRepository,
    subscriptionRepository,
    identityDeps: {
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
    },
  }
}
