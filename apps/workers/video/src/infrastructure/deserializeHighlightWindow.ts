import type { HighlightWindow } from "../domain/types"

export function deserializeHighlightWindow(value: unknown): HighlightWindow | null {
  if (!value || typeof value !== "object") {
    return null
  }
  const { startMs, endMs } = value as { startMs?: unknown; endMs?: unknown }
  if (typeof startMs !== "number" || typeof endMs !== "number") {
    return null
  }
  return { startMs, endMs }
}
