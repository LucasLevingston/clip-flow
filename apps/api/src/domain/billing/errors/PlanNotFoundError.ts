export class PlanNotFoundError extends Error {
  constructor(planId: string) {
    super(`Plan not found: "${planId}"`)
    this.name = "PlanNotFoundError"
  }
}
