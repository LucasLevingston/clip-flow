export const channelKeys = {
  all: ["channels"] as const,
  niches: () => [...channelKeys.all, "niches"] as const,
  lists: () => [...channelKeys.all, "list"] as const,
  list: () => [...channelKeys.lists()] as const,
  details: () => [...channelKeys.all, "detail"] as const,
  detail: (channelId: string) => [...channelKeys.details(), channelId] as const,
  insights: (channelId: string) => [...channelKeys.all, "insights", channelId] as const,
}
