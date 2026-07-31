import type { FastifyReply, FastifyRequest } from "fastify"
import type { TriggerChannelGenerationUseCase } from "../../../../application/use-cases/channel-management/TriggerChannelGenerationUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

/** `POST /v1/channels/:channelId/generate-now` — see docs/api/channels-api.md. */
export function createTriggerChannelGenerationHandler(useCase: TriggerChannelGenerationUseCase) {
  return async function triggerChannelGenerationHandler(
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
      return reply.status(202).send()
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
