import cookie from "@fastify/cookie"
import cors from "@fastify/cors"
import Fastify, { type FastifyInstance } from "fastify"
import { healthRoute } from "./healthRoute"
import { type AdminRoutesDeps, registerAdminRoutes } from "./routes/adminRoutes"
import { type AnalyticsRoutesDeps, registerAnalyticsRoutes } from "./routes/analyticsRoutes"
import { type AuthRoutesDeps, registerAuthRoutes } from "./routes/authRoutes"
import { type BillingRoutesDeps, registerBillingRoutes } from "./routes/billingRoutes"
import { type CatalogRoutesDeps, registerCatalogRoutes } from "./routes/catalogRoutes"
import { type ChannelRoutesDeps, registerChannelRoutes } from "./routes/channelRoutes"
import { type MemberRoutesDeps, registerMemberRoutes } from "./routes/memberRoutes"
import {
  type NotificationRoutesDeps,
  registerNotificationRoutes,
} from "./routes/notificationRoutes"
import {
  type SocialAccountRoutesDeps,
  registerSocialAccountRoutes,
} from "./routes/socialAccountRoutes"
import {
  type SubscriptionRoutesDeps,
  registerSubscriptionRoutes,
} from "./routes/subscriptionRoutes"
import { type VideoRoutesDeps, registerVideoRoutes } from "./routes/videoRoutes"
import "./types"

export interface ServerDeps {
  admin: AdminRoutesDeps
  auth: AuthRoutesDeps
  members: MemberRoutesDeps
  catalog: CatalogRoutesDeps
  subscription: SubscriptionRoutesDeps
  billing: BillingRoutesDeps
  channels: ChannelRoutesDeps
  socialAccounts: SocialAccountRoutesDeps
  notifications: NotificationRoutesDeps
  videos: VideoRoutesDeps
  analytics: AnalyticsRoutesDeps
}

/**
 * Separated from `listen()` so tests can exercise routes via `.inject()`
 * without binding a real port (see ADR-0015).
 */
export function buildServer(deps: ServerDeps): FastifyInstance {
  const app = Fastify({ logger: true })

  app.register(cookie)
  app.register(cors, {
    origin: process.env.WEB_APP_URL ?? "http://localhost:3000",
    credentials: true,
  })

  healthRoute(app)
  registerAdminRoutes(app, deps.admin)
  registerAuthRoutes(app, deps.auth)
  registerMemberRoutes(app, deps.members)
  registerCatalogRoutes(app, deps.catalog)
  registerSubscriptionRoutes(app, deps.subscription)
  registerBillingRoutes(app, deps.billing)
  registerChannelRoutes(app, deps.channels)
  registerSocialAccountRoutes(app, deps.socialAccounts)
  registerNotificationRoutes(app, deps.notifications)
  registerVideoRoutes(app, deps.videos)
  registerAnalyticsRoutes(app, deps.analytics)

  return app
}
