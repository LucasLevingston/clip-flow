import { updateChannelConfigSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { UpdateChannelConfigUseCase } from "../../../../application/use-cases/channel-management/UpdateChannelConfigUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `PATCH /v1/channels/:channelId` — see docs/api/channels-api.md. Must run after authMiddleware + requireRole. */
export function createUpdateChannelConfigHandler(useCase: UpdateChannelConfigUseCase) {
  return async function updateChannelConfigHandler(
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

    const input = parseOrSendValidationError(updateChannelConfigSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        tenantId: request.auth.tenantId,
        channelId: request.params.channelId,
        ...input,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
