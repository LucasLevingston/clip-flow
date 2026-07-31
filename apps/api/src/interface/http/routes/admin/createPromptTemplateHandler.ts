import { createPromptTemplateSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { CreatePromptTemplateUseCase } from "../../../../application/use-cases/catalog/CreatePromptTemplateUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

type Params = { id: string }

/** `POST /v1/admin/niches/:id/prompt-templates` — see docs/api/admin-api.md. */
export function createCreatePromptTemplateHandler(useCase: CreatePromptTemplateUseCase) {
  return async function createPromptTemplateHandler(
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

    const input = parseOrSendValidationError(createPromptTemplateSchema, request.body, reply)
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
