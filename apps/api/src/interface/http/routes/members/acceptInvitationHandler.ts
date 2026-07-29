import { acceptInvitationSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { AcceptInvitationUseCase } from "../../../../application/use-cases/identity/AcceptInvitationUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `POST /v1/members/invitations/accept` — see docs/api/members-api.md. Must run after authMiddleware. */
export function createAcceptInvitationHandler(useCase: AcceptInvitationUseCase) {
  return async function acceptInvitationHandler(request: FastifyRequest, reply: FastifyReply) {
    const auth = request.auth
    if (!auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(acceptInvitationSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({ tenantId: input.tenantId, userId: auth.sub })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
