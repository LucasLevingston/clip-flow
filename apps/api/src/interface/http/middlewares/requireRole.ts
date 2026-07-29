import type { FastifyReply, FastifyRequest } from "fastify"
import type { MembershipRole } from "../../../domain/identity/types"
import { sendError } from "../sendError"

/** Must run after authMiddleware — reads the role authMiddleware already resolved. */
export function requireRole(allowedRoles: MembershipRole[]) {
  return function requireRoleHandler(
    request: FastifyRequest,
    reply: FastifyReply,
    done: () => void,
  ) {
    const role = request.auth?.role
    if (!role || !allowedRoles.includes(role)) {
      sendError(reply, {
        statusCode: 403,
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action",
      })
      return
    }
    done()
  }
}
