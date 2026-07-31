import { listNichesAdminQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListNichesAdminUseCase } from "../../../../application/use-cases/catalog/ListNichesAdminUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/admin/niches` — see docs/api/admin-api.md. */
export function createListNichesAdminHandler(useCase: ListNichesAdminUseCase) {
  return async function listNichesAdminHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(listNichesAdminQuerySchema, request.query, reply)
    if (!input) return reply

    const result = await useCase.execute(input)
    return reply.status(200).send(result)
  }
}
