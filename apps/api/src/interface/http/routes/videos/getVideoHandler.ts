import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetVideoUseCase } from "../../../../application/use-cases/videos/GetVideoUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

type Params = { id: string }

/** `GET /v1/videos/:id` — see docs/api/videos-api.md. */
export function createGetVideoHandler(useCase: GetVideoUseCase) {
  return async function getVideoHandler(
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
        tenantId: request.auth.tenantId,
        videoId: request.params.id,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
