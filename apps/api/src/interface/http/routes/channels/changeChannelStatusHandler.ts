import { changeChannelStatusSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ChangeChannelStatusUseCase } from "../../../../application/use-cases/channel-management/ChangeChannelStatusUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `PATCH /v1/channels/:channelId/status` — see docs/api/channels-api.md. Must run after authMiddleware + requireRole. */
export function createChangeChannelStatusHandler(useCase: ChangeChannelStatusUseCase) {
  return async function changeChannelStatusHandler(
    request: FastifyRequest<{ Params: { channelId: string } }>,
    reply: FastifyReply,
  ) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(changeChannelStatusSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        tenantId: request.auth.tenantId,
        channelId: request.params.channelId,
        status: input.status,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
