import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetVideoTimeseriesUseCase } from "../../../../application/use-cases/analytics/GetVideoTimeseriesUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

type Params = { generatedVideoId: string }

/** `GET /v1/analytics/videos/:generatedVideoId/timeseries` — see docs/api/analytics-api.md. */
export function createGetVideoTimeseriesHandler(useCase: GetVideoTimeseriesUseCase) {
  return async function getVideoTimeseriesHandler(
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
        generatedVideoId: request.params.generatedVideoId,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
