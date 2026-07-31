import { setupServer } from "msw/node"
import { adminHealthHandlers } from "@/features/admin-health/mocks/handlers"
import { adminNichesHandlers } from "@/features/admin-niches/mocks/handlers"
import { analyticsHandlers } from "@/features/analytics/mocks/handlers"
import { authHandlers } from "@/features/auth/mocks/handlers"
import { channelsHandlers } from "@/features/channels/mocks/handlers"
import { videosHandlers } from "@/features/videos/mocks/handlers"

export const server = setupServer(
  ...authHandlers,
  ...channelsHandlers,
  ...videosHandlers,
  ...analyticsHandlers,
  ...adminNichesHandlers,
  ...adminHealthHandlers,
)
