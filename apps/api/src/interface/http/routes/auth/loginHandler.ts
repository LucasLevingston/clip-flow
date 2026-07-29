import { loginSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { LoginUseCase } from "../../../../application/use-cases/identity/LoginUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { refreshTokenCookie } from "../../refreshTokenCookie"
import { sendError } from "../../sendError"

/** `POST /v1/auth/login` — see docs/api/auth-api.md. */
export function createLoginHandler(useCase: LoginUseCase) {
  return async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
    const input = parseOrSendValidationError(loginSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute(input)
      refreshTokenCookie.set(reply, result.refreshToken)
      return reply.status(200).send({ accessToken: result.accessToken })
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
