/** Parses an `<itunes:duration>` value — either plain seconds ("245") or "HH:MM:SS"/"MM:SS". */
export function parseItunesDuration(raw: string): number {
  const trimmed = raw.trim()
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed)
  }

  const parts = trimmed.split(":").map(Number)
  if (parts.some((part) => Number.isNaN(part))) {
    return 0
  }

  return parts.reduceRight(
    (total, part, index, all) => total + part * 60 ** (all.length - 1 - index),
    0,
  )
}
