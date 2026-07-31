import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetPlatformHealthUseCase } from "../../../../application/use-cases/health/GetPlatformHealthUseCase"
import { sendError } from "../../sendError"

/** `GET /v1/admin/health` — see docs/api/admin-api.md. */
export function createGetPlatformHealthHandler(useCase: GetPlatformHealthUseCase) {
  return async function getPlatformHealthHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const result = await useCase.execute()
    return reply.status(200).send(result)
  }
}
