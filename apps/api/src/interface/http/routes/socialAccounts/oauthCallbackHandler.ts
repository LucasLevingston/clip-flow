import { oauthCallbackSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ConnectSocialAccountUseCase } from "../../../../application/use-cases/channel-management/ConnectSocialAccountUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"
import { parsePlatformParam } from "./parsePlatformParam"

type Params = { channelId: string; platform: string }

/** `POST /v1/channels/:channelId/social-accounts/:platform/oauth-callback` — see docs/api/social-accounts-api.md. */
export function createOAuthCallbackHandler(useCase: ConnectSocialAccountUseCase) {
  return async function oauthCallbackHandler(
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

    const platform = parsePlatformParam(request.params.platform)
    if (!platform) {
      return sendError(reply, {
        statusCode: 422,
        code: "VALIDATION_ERROR",
        message: `Unsupported platform "${request.params.platform}"`,
      })
    }

    const input = parseOrSendValidationError(oauthCallbackSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        tenantId: request.auth.tenantId,
        channelId: request.params.channelId,
        platform,
        code: input.code,
        state: input.state,
      })
      return reply.status(201).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
