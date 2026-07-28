import type { FastifyInstance } from "fastify";

/**
 * Liveness endpoint for the API process (see docs/observability/observability.md
 * — distinct from the Health Worker's own business-level queue/integration
 * monitoring).
 */
export function healthRoute(app: FastifyInstance): void {
  app.get("/healthz", () => ({ status: "ok" }));
}
