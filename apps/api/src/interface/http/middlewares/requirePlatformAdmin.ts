import type { FastifyReply, FastifyRequest } from "fastify"
import { sendError } from "../sendError"

/** RF-15 — admin console routes. Must run after authMiddleware; ignores tenant role entirely. */
export function requirePlatformAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void,
): void {
  if (!request.auth?.isPlatformAdmin) {
    sendError(reply, {
      statusCode: 403,
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    })
    return
  }
  done()
}
