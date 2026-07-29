import type { FastifyReply } from "fastify"

export interface ErrorEnvelope {
  statusCode: number
  code: string
  message: string
  details?: Record<string, unknown>
}

/** Standard error envelope — see docs/api/README.md#formato-de-erro-padrão. */
export function sendError(reply: FastifyReply, envelope: ErrorEnvelope): FastifyReply {
  const { statusCode, code, message, details } = envelope
  return reply.status(statusCode).send({ error: { code, message, details } })
}
