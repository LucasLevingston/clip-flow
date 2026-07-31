import type { ContentSourceConfigAdmin } from "../types"

const initial: ContentSourceConfigAdmin[] = []

export const contentSourceConfigsStore = {
  items: [...initial],
  reset(): void {
    this.items = [...initial]
  },
}
