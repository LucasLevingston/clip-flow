import { reviewFlaggedVideoSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ReviewFlaggedVideoUseCase } from "../../../../application/use-cases/content-generation/ReviewFlaggedVideoUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

type Params = { generatedVideoId: string }

/** `PATCH /v1/admin/moderation-queue/:generatedVideoId` — see docs/api/admin-api.md. */
export function createReviewFlaggedVideoHandler(useCase: ReviewFlaggedVideoUseCase) {
  return async function reviewFlaggedVideoHandler(
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

    const input = parseOrSendValidationError(reviewFlaggedVideoSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        actorUserId: request.auth.sub,
        generatedVideoId: request.params.generatedVideoId,
        decision: input.decision,
        reason: input.reason,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
