import { channelPipelineQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetChannelPipelineUseCase } from "../../../../application/use-cases/videos/GetChannelPipelineUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/videos/pipeline?channelId=` — see docs/api/videos-api.md. */
export function createGetChannelPipelineHandler(useCase: GetChannelPipelineUseCase) {
  return async function getChannelPipelineHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(channelPipelineQuerySchema, request.query, reply)
    if (!input) return reply

    const result = await useCase.execute({
      tenantId: request.auth.tenantId,
      channelId: input.channelId,
    })
    return reply.status(200).send(result)
  }
}
