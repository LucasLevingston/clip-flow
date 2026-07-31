import type { Niche, NicheStatus } from "../entities/Niche"

export interface NicheListFilter {
  page: number
  pageSize: number
  category?: string | undefined
}

export interface NicheListResult {
  items: Niche[]
  total: number
}

export interface NicheAdminListFilter {
  page: number
  pageSize: number
  status?: NicheStatus | undefined
}

export interface NicheRepository {
  findActivePaginated(filter: NicheListFilter): Promise<NicheListResult>
  findActiveById(id: string): Promise<Niche | null>
  /** Unfiltered by status — used where a niche referenced by existing data must still resolve (e.g. Channel list). */
  findById(id: string): Promise<Niche | null>
  findBySlug(slug: string): Promise<Niche | null>
  /** Unfiltered-by-status listing for the admin console — `GET /v1/admin/niches`. */
  findAllPaginated(filter: NicheAdminListFilter): Promise<NicheListResult>
  save(niche: Niche): Promise<void>
}
