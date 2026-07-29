import cookie from "@fastify/cookie"
import Fastify, { type FastifyInstance } from "fastify"
import { healthRoute } from "./healthRoute"
import { type AuthRoutesDeps, registerAuthRoutes } from "./routes/authRoutes"
import { type BillingRoutesDeps, registerBillingRoutes } from "./routes/billingRoutes"
import { type CatalogRoutesDeps, registerCatalogRoutes } from "./routes/catalogRoutes"
import { type MemberRoutesDeps, registerMemberRoutes } from "./routes/memberRoutes"
import {
  type SubscriptionRoutesDeps,
  registerSubscriptionRoutes,
} from "./routes/subscriptionRoutes"
import "./types"

export interface ServerDeps {
  auth: AuthRoutesDeps
  members: MemberRoutesDeps
  catalog: CatalogRoutesDeps
  subscription: SubscriptionRoutesDeps
  billing: BillingRoutesDeps
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
  registerCatalogRoutes(app, deps.catalog)
  registerSubscriptionRoutes(app, deps.subscription)
  registerBillingRoutes(app, deps.billing)

  return app
}
