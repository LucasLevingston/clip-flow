import { createChannelSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { CreateChannelUseCase } from "../../../../application/use-cases/channel-management/CreateChannelUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `POST /v1/channels` — see docs/api/channels-api.md. Must run after authMiddleware + requireRole. */
export function createCreateChannelHandler(useCase: CreateChannelUseCase) {
  return async function createChannelHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(createChannelSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        tenantId: request.auth.tenantId,
        nicheId: input.nicheId,
        name: input.name,
        language: input.language,
        promptOverride: input.promptOverride ?? null,
        videosPerDay: input.videosPerDay,
        publishTimes: input.publishTimes ?? null,
        generationTime: input.generationTime,
        platforms: input.platforms,
        thumbnailEnabled: input.thumbnailEnabled,
      })
      return reply.status(201).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
