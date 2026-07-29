import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetNicheUseCase } from "../../../../application/use-cases/catalog/GetNicheUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

/** `GET /v1/niches/:nicheId` — see docs/api/niches-api.md. Must run after authMiddleware. */
export function createGetNicheHandler(useCase: GetNicheUseCase) {
  return async function getNicheHandler(
    request: FastifyRequest<{ Params: { nicheId: string } }>,
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
      const result = await useCase.execute({ nicheId: request.params.nicheId })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
