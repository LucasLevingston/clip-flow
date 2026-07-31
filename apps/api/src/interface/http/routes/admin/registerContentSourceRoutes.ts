import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import type { CreateContentSourceConfigUseCase } from "../../../../application/use-cases/catalog/CreateContentSourceConfigUseCase"
import type { DiscoverContentUseCase } from "../../../../application/use-cases/catalog/DiscoverContentUseCase"
import type { ListContentSourceConfigsUseCase } from "../../../../application/use-cases/catalog/ListContentSourceConfigsUseCase"
import { createCreateContentSourceConfigHandler } from "./createContentSourceConfigHandler"
import { createDiscoverContentHandler } from "./discoverContentHandler"
import { createListContentSourceConfigsHandler } from "./listContentSourceConfigsHandler"

export interface ContentSourceRoutesDeps {
  createContentSourceConfigUseCase: CreateContentSourceConfigUseCase
  listContentSourceConfigsUseCase: ListContentSourceConfigsUseCase
  discoverContentUseCase: DiscoverContentUseCase
}

/** ADR-0006 — registers the ContentSourceConfig CRUD + discovery-trigger routes. */
type PreHandler = (request: FastifyRequest, reply: FastifyReply, done: () => void) => void

export function registerContentSourceRoutes(
  app: FastifyInstance,
  deps: ContentSourceRoutesDeps,
  preHandler: PreHandler[],
): void {
  app.get<{ Params: { id: string } }>(
    "/v1/admin/niches/:id/content-sources",
    { preHandler },
    createListContentSourceConfigsHandler(deps.listContentSourceConfigsUseCase),
  )

  app.post<{ Params: { id: string } }>(
    "/v1/admin/niches/:id/content-sources",
    { preHandler },
    createCreateContentSourceConfigHandler(deps.createContentSourceConfigUseCase),
  )

  app.post<{ Params: { id: string } }>(
    "/v1/admin/niches/:id/content-sources/discover",
    { preHandler },
    createDiscoverContentHandler(deps.discoverContentUseCase),
  )
}
