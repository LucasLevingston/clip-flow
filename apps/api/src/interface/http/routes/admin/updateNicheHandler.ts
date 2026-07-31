import { updateNicheSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { UpdateNicheUseCase } from "../../../../application/use-cases/catalog/UpdateNicheUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

type Params = { id: string }

/** `PATCH /v1/admin/niches/:id` — see docs/api/admin-api.md. */
export function createUpdateNicheHandler(useCase: UpdateNicheUseCase) {
  return async function updateNicheHandler(
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

    const input = parseOrSendValidationError(updateNicheSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        actorUserId: request.auth.sub,
        nicheId: request.params.id,
        ...input,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
