import type { FastifyReply, FastifyRequest } from "fastify"
import type { LogoutUseCase } from "../../../../application/use-cases/identity/LogoutUseCase"
import { refreshTokenCookie } from "../../refreshTokenCookie"

/** `POST /v1/auth/logout` — idempotent, always succeeds. */
export function createLogoutHandler(useCase: LogoutUseCase) {
  return async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies[refreshTokenCookie.name]
    if (token) {
      await useCase.execute({ refreshToken: token })
    }
    refreshTokenCookie.clear(reply)
    return reply.status(204).send()
  }
}
