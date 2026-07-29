export const channelKeys = {
  all: ["channels"] as const,
  niches: () => [...channelKeys.all, "niches"] as const,
}
