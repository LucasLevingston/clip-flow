export const adminNichesKeys = {
  all: ["admin-niches"] as const,
  niches: () => [...adminNichesKeys.all, "niches"] as const,
  sourceVideos: () => [...adminNichesKeys.all, "source-videos"] as const,
}
