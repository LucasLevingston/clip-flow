import cookie from "@fastify/cookie"
import Fastify, { type FastifyInstance } from "fastify"
import { healthRoute } from "./healthRoute"
import { type AuthRoutesDeps, registerAuthRoutes } from "./routes/authRoutes"
import { type MemberRoutesDeps, registerMemberRoutes } from "./routes/memberRoutes"
import "./types"

export interface ServerDeps {
  auth: AuthRoutesDeps
  members: MemberRoutesDeps
}

/**
 * Separated from `listen()` so tests can exercise routes via `.inject()`
 * without binding a real port (see ADR-0015).
 */
export function buildServer(deps: ServerDeps): FastifyInstance {
  const app = Fastify({ logger: true })

  app.register(cookie)

  healthRoute(app)
  registerAuthRoutes(app, deps.auth)
  registerMemberRoutes(app, deps.members)

  return app
}
