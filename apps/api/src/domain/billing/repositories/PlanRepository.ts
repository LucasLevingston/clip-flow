import type { Plan } from "../entities/Plan"

export interface PlanRepository {
  findAll(): Promise<Plan[]>
  findById(id: string): Promise<Plan | null>
}
