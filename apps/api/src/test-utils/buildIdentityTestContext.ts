import { SessionIssuer } from "../application/services/SessionIssuer"
import { FakeClock } from "./fakes/FakeClock"
import { FakeIdGenerator } from "./fakes/FakeIdGenerator"
import { FakeJwtService } from "./fakes/FakeJwtService"
import { FakePasswordHasher } from "./fakes/FakePasswordHasher"
import { FakeRefreshTokenHasher } from "./fakes/FakeRefreshTokenHasher"
import { FakeSecureTokenGenerator } from "./fakes/FakeSecureTokenGenerator"
import { InMemoryInvitationRepository } from "./fakes/InMemoryInvitationRepository"
import { InMemoryMembershipRepository } from "./fakes/InMemoryMembershipRepository"
import { InMemoryRefreshTokenRepository } from "./fakes/InMemoryRefreshTokenRepository"
import { InMemorySubscriptionRepository } from "./fakes/InMemorySubscriptionRepository"
import { InMemoryTenantRepository } from "./fakes/InMemoryTenantRepository"
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository"

/** Wires every identity-context fake together, reused across use case tests. */
export function buildIdentityTestContext() {
  const userRepository = new InMemoryUserRepository()
  const tenantRepository = new InMemoryTenantRepository()
  const membershipRepository = new InMemoryMembershipRepository()
  const subscriptionRepository = new InMemorySubscriptionRepository()
  const refreshTokenRepository = new InMemoryRefreshTokenRepository()
  const invitationRepository = new InMemoryInvitationRepository()
  const passwordHasher = new FakePasswordHasher()
  const refreshTokenHasher = new FakeRefreshTokenHasher()
  const clock = new FakeClock()
  const jwtService = new FakeJwtService()

  const sessionIssuer = new SessionIssuer({
    jwtService,
    refreshTokenRepository,
    refreshTokenHasher,
    secureTokenGenerator: new FakeSecureTokenGenerator(),
    clock,
  })

  return {
    userRepository,
    tenantRepository,
    membershipRepository,
    subscriptionRepository,
    refreshTokenRepository,
    invitationRepository,
    passwordHasher,
    refreshTokenHasher,
    idGenerator: new FakeIdGenerator(),
    clock,
    jwtService,
    sessionIssuer,
  }
}
