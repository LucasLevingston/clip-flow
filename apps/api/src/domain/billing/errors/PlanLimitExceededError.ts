export class PlanLimitExceededError extends Error {
  constructor(readonly limit: "channels" | "videosPerDay") {
    super(`Plan limit exceeded: "${limit}"`)
    this.name = "PlanLimitExceededError"
  }
}
