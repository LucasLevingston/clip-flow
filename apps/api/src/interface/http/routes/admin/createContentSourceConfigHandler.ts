import { createContentSourceConfigSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { CreateContentSourceConfigUseCase } from "../../../../application/use-cases/catalog/CreateContentSourceConfigUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

type Params = { id: string }

/** `POST /v1/admin/niches/:id/content-sources` — see docs/api/admin-api.md. */
export function createCreateContentSourceConfigHandler(useCase: CreateContentSourceConfigUseCase) {
  return async function createContentSourceConfigHandler(
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

    const input = parseOrSendValidationError(createContentSourceConfigSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        actorUserId: request.auth.sub,
        nicheId: request.params.id,
        ...input,
      })
      return reply.status(201).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
