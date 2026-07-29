import type { AccessTokenPayload, JwtService } from "../../domain/identity/services/JwtService"

/** Round-trips the payload through JSON instead of real signing/verification. */
export class FakeJwtService implements JwtService {
  signAccessToken(payload: AccessTokenPayload): string {
    return `fake-jwt:${JSON.stringify(payload)}`
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    if (!token.startsWith("fake-jwt:")) {
      throw new Error("Invalid token")
    }
    return JSON.parse(token.slice("fake-jwt:".length)) as AccessTokenPayload
  }
}
