import type { ChannelInsightsResult, ChannelPerformanceRecord } from "../types"

const STOPWORDS = new Set([
  "para",
  "com",
  "essa",
  "esse",
  "isso",
  "muito",
  "mais",
  "menos",
  "que",
  "the",
  "and",
  "for",
])

function engagementScore(record: ChannelPerformanceRecord): number {
  return record.views + record.likes * 2 + record.comments * 3 + record.shares * 3
}

function topPerforming(records: ChannelPerformanceRecord[]): ChannelPerformanceRecord[] {
  const sorted = [...records].sort((a, b) => engagementScore(b) - engagementScore(a))
  const cutoff = Math.max(1, Math.ceil(sorted.length / 2))
  return sorted.slice(0, cutoff)
}

function rankBestPublishHours(records: ChannelPerformanceRecord[]): number[] {
  const scoreByHour = new Map<number, { total: number; count: number }>()
  for (const record of records) {
    const hour = record.publishedAt.getUTCHours()
    const entry = scoreByHour.get(hour) ?? { total: 0, count: 0 }
    entry.total += engagementScore(record)
    entry.count += 1
    scoreByHour.set(hour, entry)
  }
  return [...scoreByHour.entries()]
    .map(([hour, { total, count }]) => ({ hour, avg: total / count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3)
    .map((entry) => entry.hour)
}

function extractTopWords(titles: string[], limit: number): string[] {
  const frequency = new Map<string, number>()
  for (const title of titles) {
    const words = title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !STOPWORDS.has(word))
    for (const word of words) {
      frequency.set(word, (frequency.get(word) ?? 0) + 1)
    }
  }
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}

function extractTopHashtags(hashtagLists: string[][], limit: number): string[] {
  const frequency = new Map<string, number>()
  for (const hashtags of hashtagLists) {
    for (const hashtag of hashtags) {
      frequency.set(hashtag, (frequency.get(hashtag) ?? 0) + 1)
    }
  }
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([hashtag]) => hashtag)
}

/**
 * Pure — no I/O. Derives ChannelInsights from the channel's performance history (RF-17).
 * Engagement is weighted (likes/comments/shares count more than raw views) and title/hashtag/
 * duration patterns are mined only from the top-performing half of the history.
 */
export function computeChannelInsights(records: ChannelPerformanceRecord[]): ChannelInsightsResult {
  const best = topPerforming(records)
  const avgOptimalDurationMs = Math.round(
    best.reduce((sum, record) => sum + record.durationMs, 0) / best.length,
  )

  return {
    bestPublishHours: rankBestPublishHours(records),
    topTitlePatterns: extractTopWords(
      best.map((record) => record.title),
      5,
    ),
    topHashtags: extractTopHashtags(
      best.map((record) => record.hashtags),
      5,
    ),
    avgOptimalDurationMs,
  }
}
