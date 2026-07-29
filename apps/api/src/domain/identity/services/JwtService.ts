import type { MembershipRole } from "../types"

export interface AccessTokenPayload {
  sub: string
  tenantId: string
  role: MembershipRole
  isPlatformAdmin: boolean
}

export interface JwtService {
  signAccessToken(payload: AccessTokenPayload): string
  verifyAccessToken(token: string): AccessTokenPayload
}
