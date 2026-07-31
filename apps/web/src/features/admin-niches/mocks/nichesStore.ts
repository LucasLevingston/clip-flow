import type { NicheAdmin } from "../types"

const initial: NicheAdmin[] = [
  {
    id: "niche-1",
    name: "Futebol",
    slug: "futebol",
    description: "Melhores momentos do futebol",
    category: "Esportes",
    previewThumbnailUrl: null,
    status: "ACTIVE",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "niche-2",
    name: "Basquete",
    slug: "basquete",
    description: "Lances de basquete",
    category: "Esportes",
    previewThumbnailUrl: null,
    status: "INACTIVE",
    createdAt: "2026-07-02T00:00:00.000Z",
  },
]

export const nichesStore = {
  items: initial.map((niche) => ({ ...niche })),
  reset(): void {
    this.items = initial.map((niche) => ({ ...niche }))
  },
}
