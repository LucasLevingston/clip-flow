import { listChannelsQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListChannelsUseCase } from "../../../../application/use-cases/channel-management/ListChannelsUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/channels` — see docs/api/channels-api.md. Must run after authMiddleware. */
export function createListChannelsHandler(useCase: ListChannelsUseCase) {
  return async function listChannelsHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(listChannelsQuerySchema, request.query, reply)
    if (!input) return reply

    const result = await useCase.execute({ tenantId: request.auth.tenantId, ...input })
    return reply.status(200).send(result)
  }
}
