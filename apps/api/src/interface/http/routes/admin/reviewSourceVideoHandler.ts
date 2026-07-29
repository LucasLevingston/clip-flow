import { reviewSourceVideoSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ReviewSourceVideoUseCase } from "../../../../application/use-cases/catalog/ReviewSourceVideoUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

type Params = { id: string }

/** `PATCH /v1/admin/source-videos/:id/review` — see docs/api/admin-api.md. */
export function createReviewSourceVideoHandler(useCase: ReviewSourceVideoUseCase) {
  return async function reviewSourceVideoHandler(
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

    const input = parseOrSendValidationError(reviewSourceVideoSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        actorUserId: request.auth.sub,
        sourceVideoId: request.params.id,
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
