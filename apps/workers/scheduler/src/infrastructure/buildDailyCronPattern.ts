/** Converts a "HH:mm" time into a BullMQ/cron pattern that fires once a day at that time. */
export function buildDailyCronPattern(generationTime: string): string {
  const [hour, minute] = generationTime.split(":")
  return `${minute} ${hour} * * *`
}
