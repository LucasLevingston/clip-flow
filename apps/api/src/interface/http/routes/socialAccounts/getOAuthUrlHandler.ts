import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetSocialAccountOAuthUrlUseCase } from "../../../../application/use-cases/channel-management/GetSocialAccountOAuthUrlUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"
import { parsePlatformParam } from "./parsePlatformParam"

type Params = { channelId: string; platform: string }

/** `GET /v1/channels/:channelId/social-accounts/:platform/oauth-url` — see docs/api/social-accounts-api.md. */
export function createGetOAuthUrlHandler(useCase: GetSocialAccountOAuthUrlUseCase) {
  return async function getOAuthUrlHandler(
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

    try {
      const result = await useCase.execute({
        tenantId: request.auth.tenantId,
        channelId: request.params.channelId,
        platform,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
