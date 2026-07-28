import Fastify, { type FastifyInstance } from "fastify"
import { healthRoute } from "./healthRoute"

/**
 * Separated from `listen()` so tests can exercise routes via `.inject()`
 * without binding a real port (see ADR-0015).
 */
export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: true })

  healthRoute(app)

  return app
}
