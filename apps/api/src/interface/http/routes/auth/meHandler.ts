import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetCurrentUserUseCase } from "../../../../application/use-cases/identity/GetCurrentUserUseCase"
import { sendError } from "../../sendError"

/** `GET /v1/auth/me` — requires authMiddleware to have set `request.auth`. */
export function createMeHandler(useCase: GetCurrentUserUseCase) {
  return async function meHandler(request: FastifyRequest, reply: FastifyReply) {
    const auth = request.auth
    if (!auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const result = await useCase.execute({ userId: auth.sub, tenantId: auth.tenantId })
    if (!result) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "User no longer belongs to this tenant",
      })
    }

    return reply.status(200).send(result)
  }
}
