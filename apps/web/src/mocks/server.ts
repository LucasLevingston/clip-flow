import { setupServer } from "msw/node"
import { channelsHandlers } from "@/features/channels/mocks/handlers"

export const server = setupServer(...channelsHandlers)
