import type { Niche } from "../entities/Niche"

export interface NicheListFilter {
  page: number
  pageSize: number
  category?: string | undefined
}

export interface NicheListResult {
  items: Niche[]
  total: number
}

export interface NicheRepository {
  findActivePaginated(filter: NicheListFilter): Promise<NicheListResult>
  findActiveById(id: string): Promise<Niche | null>
}
