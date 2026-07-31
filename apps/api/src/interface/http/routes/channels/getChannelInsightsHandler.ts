import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetChannelInsightsUseCase } from "../../../../application/use-cases/channel-management/GetChannelInsightsUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

type Params = { channelId: string }

/** `GET /v1/channels/:channelId/insights` — see docs/api/channels-api.md. */
export function createGetChannelInsightsHandler(useCase: GetChannelInsightsUseCase) {
  return async function getChannelInsightsHandler(
    request: FastifyRequest<{ Params: Params }>,
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
      if (!result) {
        return reply.status(204).send()
      }
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
