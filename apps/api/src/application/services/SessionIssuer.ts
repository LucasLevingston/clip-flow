import type { Clock } from "../../domain/identity/services/Clock"
import type { JwtService } from "../../domain/identity/services/JwtService"
import type { RefreshTokenHasher } from "../../domain/identity/services/RefreshTokenHasher"
import type { RefreshTokenRepository } from "../../domain/identity/repositories/RefreshTokenRepository"
import type { SecureTokenGenerator } from "../../domain/identity/services/SecureTokenGenerator"
import type { MembershipRole } from "../../domain/identity/types"

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface IssuedSession {
  accessToken: string
  refreshToken: string
}

export interface SessionIssuerDeps {
  jwtService: JwtService
  refreshTokenRepository: RefreshTokenRepository
  refreshTokenHasher: RefreshTokenHasher
  secureTokenGenerator: SecureTokenGenerator
  clock: Clock
}

/**
 * Shared by RegisterTenantUseCase, LoginUseCase and RefreshAccessTokenUseCase
 * so token issuance/rotation logic (RNF — refresh token rotativo) lives in
 * exactly one place.
 */
export class SessionIssuer {
  constructor(private readonly deps: SessionIssuerDeps) {}

  async issue(params: {
    userId: string
    tenantId: string
    role: MembershipRole
    isPlatformAdmin: boolean
    deviceInfo?: string | null
  }): Promise<IssuedSession> {
    const accessToken = this.deps.jwtService.signAccessToken({
      sub: params.userId,
      tenantId: params.tenantId,
      role: params.role,
      isPlatformAdmin: params.isPlatformAdmin,
    })

    const rawRefreshToken = this.deps.secureTokenGenerator.generate()
    const tokenHash = this.deps.refreshTokenHasher.hash(rawRefreshToken)
    const expiresAt = new Date(this.deps.clock.now().getTime() + REFRESH_TOKEN_TTL_MS)

    await this.deps.refreshTokenRepository.create({
      userId: params.userId,
      tokenHash,
      deviceInfo: params.deviceInfo ?? null,
      expiresAt,
    })

    return { accessToken, refreshToken: rawRefreshToken }
  }
}
