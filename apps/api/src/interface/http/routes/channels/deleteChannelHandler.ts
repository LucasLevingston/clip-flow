import type { FastifyReply, FastifyRequest } from "fastify"
import type { DeleteChannelUseCase } from "../../../../application/use-cases/channel-management/DeleteChannelUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

/** `DELETE /v1/channels/:channelId` — see docs/api/channels-api.md. Must run after authMiddleware + requireRole. */
export function createDeleteChannelHandler(useCase: DeleteChannelUseCase) {
  return async function deleteChannelHandler(
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

    try {
      await useCase.execute({
        tenantId: request.auth.tenantId,
        channelId: request.params.channelId,
      })
      return reply.status(204).send()
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
