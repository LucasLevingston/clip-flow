import type { FastifyReply, FastifyRequest } from "fastify"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { sendError } from "../sendError"

const BEARER_PREFIX = "Bearer "

/**
 * Resolves `request.auth` from the JWT alone — tenantId/role are never
 * trusted from the URL or body (security/authentication-authorization.md).
 */
export function createAuthMiddleware(jwtService: JwtService) {
  return function authMiddleware(request: FastifyRequest, reply: FastifyReply, done: () => void) {
    const header = request.headers.authorization
    if (!header?.startsWith(BEARER_PREFIX)) {
      sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing or malformed Authorization header",
      })
      return
    }

    const token = header.slice(BEARER_PREFIX.length)
    try {
      request.auth = jwtService.verifyAccessToken(token)
      done()
    } catch {
      sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Invalid or expired access token",
      })
    }
  }
}
