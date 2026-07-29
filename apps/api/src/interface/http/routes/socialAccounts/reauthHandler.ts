import { oauthCallbackSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ReauthSocialAccountUseCase } from "../../../../application/use-cases/channel-management/ReauthSocialAccountUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

type Params = { channelId: string; id: string }

/** `POST /v1/channels/:channelId/social-accounts/:id/reauth` — see docs/api/social-accounts-api.md. */
export function createReauthHandler(useCase: ReauthSocialAccountUseCase) {
  return async function reauthHandler(
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

    const input = parseOrSendValidationError(oauthCallbackSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        tenantId: request.auth.tenantId,
        channelId: request.params.channelId,
        accountId: request.params.id,
        code: input.code,
        state: input.state,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
