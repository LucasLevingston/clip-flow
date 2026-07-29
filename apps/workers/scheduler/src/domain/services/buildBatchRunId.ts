/** Deterministic per (channelId, day) — reprocessing the same day never double-fires a batch. */
export function buildBatchRunId(channelId: string, referenceDate: Date): string {
  const dateKey = referenceDate.toISOString().slice(0, 10)
  return `${channelId}:${dateKey}`
}
