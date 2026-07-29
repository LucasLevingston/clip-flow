import type { FastifyReply, FastifyRequest } from "fastify"
import type { DisconnectSocialAccountUseCase } from "../../../../application/use-cases/channel-management/DisconnectSocialAccountUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

type Params = { channelId: string; id: string }

/** `DELETE /v1/channels/:channelId/social-accounts/:id` — see docs/api/social-accounts-api.md. */
export function createDisconnectSocialAccountHandler(useCase: DisconnectSocialAccountUseCase) {
  return async function disconnectSocialAccountHandler(
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
      await useCase.execute({
        tenantId: request.auth.tenantId,
        channelId: request.params.channelId,
        accountId: request.params.id,
      })
      return reply.status(204).send()
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
