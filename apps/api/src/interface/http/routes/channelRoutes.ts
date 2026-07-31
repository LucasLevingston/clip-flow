import type { FastifyInstance } from "fastify"
import type { ChangeChannelStatusUseCase } from "../../../application/use-cases/channel-management/ChangeChannelStatusUseCase"
import type { CreateChannelUseCase } from "../../../application/use-cases/channel-management/CreateChannelUseCase"
import type { DeleteChannelUseCase } from "../../../application/use-cases/channel-management/DeleteChannelUseCase"
import type { GetChannelInsightsUseCase } from "../../../application/use-cases/channel-management/GetChannelInsightsUseCase"
import type { GetChannelUseCase } from "../../../application/use-cases/channel-management/GetChannelUseCase"
import type { ListChannelsUseCase } from "../../../application/use-cases/channel-management/ListChannelsUseCase"
import type { UpdateChannelConfigUseCase } from "../../../application/use-cases/channel-management/UpdateChannelConfigUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requireRole } from "../middlewares/requireRole"
import { createChangeChannelStatusHandler } from "./channels/changeChannelStatusHandler"
import { createCreateChannelHandler } from "./channels/createChannelHandler"
import { createDeleteChannelHandler } from "./channels/deleteChannelHandler"
import { createGetChannelHandler } from "./channels/getChannelHandler"
import { createGetChannelInsightsHandler } from "./channels/getChannelInsightsHandler"
import { createListChannelsHandler } from "./channels/listChannelsHandler"
import { createUpdateChannelConfigHandler } from "./channels/updateChannelConfigHandler"

export interface ChannelRoutesDeps {
  createChannelUseCase: CreateChannelUseCase
  listChannelsUseCase: ListChannelsUseCase
  getChannelUseCase: GetChannelUseCase
  getChannelInsightsUseCase: GetChannelInsightsUseCase
  updateChannelConfigUseCase: UpdateChannelConfigUseCase
  changeChannelStatusUseCase: ChangeChannelStatusUseCase
  deleteChannelUseCase: DeleteChannelUseCase
  jwtService: JwtService
}

type ChannelIdParams = { Params: { channelId: string } }

export function registerChannelRoutes(app: FastifyInstance, deps: ChannelRoutesDeps): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)
  const requireOwnerOrAdmin = requireRole(["OWNER", "ADMIN"])
  const requireOwner = requireRole(["OWNER"])

  app.post(
    "/v1/channels",
    { preHandler: [authMiddleware, requireOwnerOrAdmin] },
    createCreateChannelHandler(deps.createChannelUseCase),
  )

  app.get(
    "/v1/channels",
    { preHandler: authMiddleware },
    createListChannelsHandler(deps.listChannelsUseCase),
  )

  app.get<ChannelIdParams>(
    "/v1/channels/:channelId",
    { preHandler: authMiddleware },
    createGetChannelHandler(deps.getChannelUseCase),
  )

  app.get<ChannelIdParams>(
    "/v1/channels/:channelId/insights",
    { preHandler: authMiddleware },
    createGetChannelInsightsHandler(deps.getChannelInsightsUseCase),
  )

  app.patch<ChannelIdParams>(
    "/v1/channels/:channelId",
    { preHandler: [authMiddleware, requireOwnerOrAdmin] },
    createUpdateChannelConfigHandler(deps.updateChannelConfigUseCase),
  )

  app.patch<ChannelIdParams>(
    "/v1/channels/:channelId/status",
    { preHandler: [authMiddleware, requireOwnerOrAdmin] },
    createChangeChannelStatusHandler(deps.changeChannelStatusUseCase),
  )

  app.delete<ChannelIdParams>(
    "/v1/channels/:channelId",
    { preHandler: [authMiddleware, requireOwner] },
    createDeleteChannelHandler(deps.deleteChannelUseCase),
  )
}
