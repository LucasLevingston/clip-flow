import { listVideosQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ExportVideosUseCase } from "../../../../application/use-cases/videos/ExportVideosUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/videos/export` — see docs/api/videos-api.md. */
export function createExportVideosHandler(useCase: ExportVideosUseCase) {
  return async function exportVideosHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(listVideosQuerySchema, request.query, reply)
    if (!input) return reply

    const filters = {
      channelId: input.channelId,
      platform: input.platform,
      status: input.status,
      from: input.from,
      to: input.to,
    }
    const csv = await useCase.execute({ tenantId: request.auth.tenantId, filters })
    return reply.header("content-type", "text/csv").status(200).send(csv)
  }
}
