import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetChannelUseCase } from "../../../../application/use-cases/channel-management/GetChannelUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

/** `GET /v1/channels/:channelId` — see docs/api/channels-api.md. Must run after authMiddleware. */
export function createGetChannelHandler(useCase: GetChannelUseCase) {
  return async function getChannelHandler(
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
      const result = await useCase.execute({
        tenantId: request.auth.tenantId,
        channelId: request.params.channelId,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
