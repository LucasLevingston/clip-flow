import { inviteMemberSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { InviteMemberUseCase } from "../../../../application/use-cases/identity/InviteMemberUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `POST /v1/members/invite` — see docs/api/members-api.md. Must run after authMiddleware + requireRole. */
export function createInviteMemberHandler(useCase: InviteMemberUseCase) {
  return async function inviteMemberHandler(request: FastifyRequest, reply: FastifyReply) {
    const auth = request.auth
    if (!auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(inviteMemberSchema, request.body, reply)
    if (!input) return reply

    try {
      const invitation = await useCase.execute({ tenantId: auth.tenantId, ...input })
      return reply.status(201).send({
        invitationId: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      })
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
