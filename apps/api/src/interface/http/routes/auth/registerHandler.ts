import { registerSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { RegisterTenantUseCase } from "../../../../application/use-cases/identity/RegisterTenantUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { refreshTokenCookie } from "../../refreshTokenCookie"
import { sendError } from "../../sendError"

/** `POST /v1/auth/register` — see docs/api/auth-api.md. */
export function createRegisterHandler(useCase: RegisterTenantUseCase) {
  return async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
    const input = parseOrSendValidationError(registerSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute(input)
      refreshTokenCookie.set(reply, result.refreshToken)
      return reply.status(201).send({
        user: { id: result.userId, email: input.email },
        tenant: { id: result.tenantId, name: input.tenantName },
        accessToken: result.accessToken,
      })
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
