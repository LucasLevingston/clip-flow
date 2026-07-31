import { setupServer } from "msw/node"
import { analyticsHandlers } from "@/features/analytics/mocks/handlers"
import { channelsHandlers } from "@/features/channels/mocks/handlers"
import { videosHandlers } from "@/features/videos/mocks/handlers"

export const server = setupServer(...channelsHandlers, ...videosHandlers, ...analyticsHandlers)
