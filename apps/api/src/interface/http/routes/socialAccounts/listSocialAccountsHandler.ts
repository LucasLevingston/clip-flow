import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListSocialAccountsUseCase } from "../../../../application/use-cases/channel-management/ListSocialAccountsUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

/** `GET /v1/channels/:channelId/social-accounts` — see docs/api/social-accounts-api.md. */
export function createListSocialAccountsHandler(useCase: ListSocialAccountsUseCase) {
  return async function listSocialAccountsHandler(
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
