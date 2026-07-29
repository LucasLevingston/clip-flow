export const channelKeys = {
  all: ["channels"] as const,
  niches: () => [...channelKeys.all, "niches"] as const,
  details: () => [...channelKeys.all, "detail"] as const,
  detail: (channelId: string) => [...channelKeys.details(), channelId] as const,
}
