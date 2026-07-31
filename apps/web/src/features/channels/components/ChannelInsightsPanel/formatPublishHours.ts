export function formatPublishHours(hours: number[]): string {
  return hours.map((hour) => `${hour}h`).join(", ")
}
