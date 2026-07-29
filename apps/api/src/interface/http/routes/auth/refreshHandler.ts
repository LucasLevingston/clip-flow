import type { FastifyReply, FastifyRequest } from "fastify"
import type { RefreshAccessTokenUseCase } from "../../../../application/use-cases/identity/RefreshAccessTokenUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { refreshTokenCookie } from "../../refreshTokenCookie"
import { sendError } from "../../sendError"

/** `POST /v1/auth/refresh` — refresh token comes only from the httpOnly cookie. */
export function createRefreshHandler(useCase: RefreshAccessTokenUseCase) {
  return async function refreshHandler(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies[refreshTokenCookie.name]
    if (!token) {
      return sendError(reply, {
        statusCode: 401,
        code: "INVALID_REFRESH_TOKEN",
        message: "Missing refresh token cookie",
      })
    }

    try {
      const result = await useCase.execute({ refreshToken: token })
      refreshTokenCookie.set(reply, result.refreshToken)
      return reply.status(200).send({ accessToken: result.accessToken })
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
