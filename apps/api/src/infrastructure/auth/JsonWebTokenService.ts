import jwt from "jsonwebtoken"
import type { AccessTokenPayload, JwtService } from "../../domain/identity/services/JwtService"

const ACCESS_TOKEN_TTL = "15m"

/** RS256 per security/authentication-authorization.md — keys injected, never read from env here. */
export class JsonWebTokenService implements JwtService {
  constructor(
    private readonly privateKey: string,
    private readonly publicKey: string,
  ) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.privateKey, { algorithm: "RS256", expiresIn: ACCESS_TOKEN_TTL })
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, this.publicKey, { algorithms: ["RS256"] }) as AccessTokenPayload
  }
}
