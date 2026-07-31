const MINUTES_PER_DAY = 24 * 60
const OFFSET_MINUTES_BEFORE_GENERATION = 30

/**
 * Converts a channel's "HH:mm" `generationTime` into a cron pattern that fires 30 minutes
 * before it, so ChannelInsights is always fresh before the Scheduler fires the day's batch
 * (docs/architecture/analytics-flow.md).
 */
export function buildInsightsCronPattern(generationTime: string): string {
  const [hourStr, minuteStr] = generationTime.split(":")
  const totalMinutes =
    (Number(hourStr) * 60 +
      Number(minuteStr) -
      OFFSET_MINUTES_BEFORE_GENERATION +
      MINUTES_PER_DAY) %
    MINUTES_PER_DAY
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  return `${minute} ${hour} * * *`
}
