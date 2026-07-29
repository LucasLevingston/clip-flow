import { ingestSourceVideoSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { IngestSourceVideoUseCase } from "../../../../application/use-cases/catalog/IngestSourceVideoUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `POST /v1/admin/source-videos` — see docs/api/admin-api.md. Must run after authMiddleware + requirePlatformAdmin. */
export function createIngestSourceVideoHandler(useCase: IngestSourceVideoUseCase) {
  return async function ingestSourceVideoHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(ingestSourceVideoSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({ actorUserId: request.auth.sub, ...input })
      return reply.status(201).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
