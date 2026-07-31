import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import type { IngestSourceVideoUseCase } from "../../../../application/use-cases/catalog/IngestSourceVideoUseCase"
import type { ListSourceVideosUseCase } from "../../../../application/use-cases/catalog/ListSourceVideosUseCase"
import type { ReviewSourceVideoUseCase } from "../../../../application/use-cases/catalog/ReviewSourceVideoUseCase"
import { createIngestSourceVideoHandler } from "./ingestSourceVideoHandler"
import { createListSourceVideosHandler } from "./listSourceVideosHandler"
import { createReviewSourceVideoHandler } from "./reviewSourceVideoHandler"

export interface SourceVideoRoutesDeps {
  listSourceVideosUseCase: ListSourceVideosUseCase
  ingestSourceVideoUseCase: IngestSourceVideoUseCase
  reviewSourceVideoUseCase: ReviewSourceVideoUseCase
}

type PreHandler = (request: FastifyRequest, reply: FastifyReply, done: () => void) => void

/** RF-07 — registers the manually-curated SourceVideo ingestion + review routes. */
export function registerSourceVideoRoutes(
  app: FastifyInstance,
  deps: SourceVideoRoutesDeps,
  preHandler: PreHandler[],
): void {
  app.get(
    "/v1/admin/source-videos",
    { preHandler },
    createListSourceVideosHandler(deps.listSourceVideosUseCase),
  )

  app.post(
    "/v1/admin/source-videos",
    { preHandler },
    createIngestSourceVideoHandler(deps.ingestSourceVideoUseCase),
  )

  app.patch<{ Params: { id: string } }>(
    "/v1/admin/source-videos/:id/review",
    { preHandler },
    createReviewSourceVideoHandler(deps.reviewSourceVideoUseCase),
  )
}
