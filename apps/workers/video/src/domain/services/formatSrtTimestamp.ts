function pad(value: number, length: number): string {
  return String(value).padStart(length, "0")
}

/** Pure. SRT timestamp format: HH:MM:SS,mmm. */
export function formatSrtTimestamp(ms: number): string {
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1_000)
  const millis = Math.floor(ms % 1_000)
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(millis, 3)}`
}
