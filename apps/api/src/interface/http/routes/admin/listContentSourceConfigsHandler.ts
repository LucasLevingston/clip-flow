import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListContentSourceConfigsUseCase } from "../../../../application/use-cases/catalog/ListContentSourceConfigsUseCase"
import { sendError } from "../../sendError"

type Params = { id: string }

/** `GET /v1/admin/niches/:id/content-sources` — see docs/api/admin-api.md. */
export function createListContentSourceConfigsHandler(useCase: ListContentSourceConfigsUseCase) {
  return async function listContentSourceConfigsHandler(
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

    const result = await useCase.execute({ nicheId: request.params.id })
    return reply.status(200).send(result)
  }
}
