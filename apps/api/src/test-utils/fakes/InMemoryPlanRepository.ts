import type { Plan } from "../../domain/billing/entities/Plan"
import type { PlanRepository } from "../../domain/billing/repositories/PlanRepository"

export class InMemoryPlanRepository implements PlanRepository {
  private readonly plansById = new Map<string, Plan>()

  seed(plan: Plan): void {
    this.plansById.set(plan.id, plan)
  }

  findAll(): Promise<Plan[]> {
    return Promise.resolve([...this.plansById.values()])
  }

  findById(id: string): Promise<Plan | null> {
    return Promise.resolve(this.plansById.get(id) ?? null)
  }
}
