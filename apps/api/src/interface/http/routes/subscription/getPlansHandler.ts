import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetPlansUseCase } from "../../../../application/use-cases/billing/GetPlansUseCase"

/** `GET /v1/plans` — see docs/api/subscriptions-api.md. Public. */
export function createGetPlansHandler(useCase: GetPlansUseCase) {
  return async function getPlansHandler(_request: FastifyRequest, reply: FastifyReply) {
    const result = await useCase.execute()
    return reply.status(200).send(result)
  }
}
