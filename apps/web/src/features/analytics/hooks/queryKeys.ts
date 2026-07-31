export const analyticsKeys = {
  all: ["analytics"] as const,
  summaries: () => [...analyticsKeys.all, "summary"] as const,
  summary: (channelId: string) => [...analyticsKeys.summaries(), channelId] as const,
}
