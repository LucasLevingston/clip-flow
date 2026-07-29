import { listNichesQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListNichesUseCase } from "../../../../application/use-cases/catalog/ListNichesUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/niches` — see docs/api/niches-api.md. Must run after authMiddleware. */
export function createListNichesHandler(useCase: ListNichesUseCase) {
  return async function listNichesHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(listNichesQuerySchema, request.query, reply)
    if (!input) return reply

    const result = await useCase.execute(input)
    return reply.status(200).send(result)
  }
}
