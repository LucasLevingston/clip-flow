const COLLECTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1_000

/** RF-13 / RNF-21 — stop polling platform APIs once a post is older than 30 days. */
export function shouldContinueCollecting(publishedAt: Date, now: Date): boolean {
  return now.getTime() - publishedAt.getTime() < COLLECTION_WINDOW_MS
}
