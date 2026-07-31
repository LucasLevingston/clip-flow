import type { FastifyReply, FastifyRequest } from "fastify"
import type { DiscoverContentUseCase } from "../../../../application/use-cases/catalog/DiscoverContentUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

type Params = { id: string }

/** `POST /v1/admin/niches/:id/content-sources/discover` — see docs/api/admin-api.md. */
export function createDiscoverContentHandler(useCase: DiscoverContentUseCase) {
  return async function discoverContentHandler(
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

    try {
      const result = await useCase.execute({
        actorUserId: request.auth.sub,
        nicheId: request.params.id,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
