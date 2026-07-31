export const adminHealthKeys = {
  all: ["admin-health"] as const,
  platform: () => [...adminHealthKeys.all, "platform"] as const,
}
