import "fastify"
import type { AccessTokenPayload } from "../../domain/identity/services/JwtService"

declare module "fastify" {
  interface FastifyRequest {
    auth?: AccessTokenPayload
  }
}
