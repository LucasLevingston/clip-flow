import type { Niche } from "../../domain/catalog/entities/Niche"
import type {
  NicheListFilter,
  NicheListResult,
  NicheRepository,
} from "../../domain/catalog/repositories/NicheRepository"

export class InMemoryNicheRepository implements NicheRepository {
  private readonly nichesById = new Map<string, Niche>()

  seed(niche: Niche): void {
    this.nichesById.set(niche.id, niche)
  }

  findActivePaginated(filter: NicheListFilter): Promise<NicheListResult> {
    const matching = [...this.nichesById.values()]
      .filter((niche) => niche.status === "ACTIVE")
      .filter((niche) => !filter.category || niche.category === filter.category)
      .sort((a, b) => a.name.localeCompare(b.name))

    const start = (filter.page - 1) * filter.pageSize
    const items = matching.slice(start, start + filter.pageSize)

    return Promise.resolve({ items, total: matching.length })
  }

  findActiveById(id: string): Promise<Niche | null> {
    const niche = this.nichesById.get(id)
    return Promise.resolve(niche && niche.status === "ACTIVE" ? niche : null)
  }

  findById(id: string): Promise<Niche | null> {
    return Promise.resolve(this.nichesById.get(id) ?? null)
  }
}
