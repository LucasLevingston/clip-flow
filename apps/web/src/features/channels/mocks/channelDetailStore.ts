function buildInitialChannelDetail() {
  return {
    id: "channel-1",
    nicheId: "niche-1",
    nicheName: "Futebol",
    name: "Meu Canal",
    language: "pt-BR",
    promptOverride: null as string | null,
    videosPerDay: 1,
    publishTimes: ["09:00"],
    generationTime: "09:00",
    platforms: "SHORTS_ONLY" as "SHORTS_ONLY" | "TIKTOK_ONLY" | "BOTH",
    thumbnailEnabled: true,
    status: "ACTIVE" as "DRAFT" | "ACTIVE" | "PAUSED",
    socialAccounts: [] as unknown[],
  }
}

export const channelDetailStore = {
  state: buildInitialChannelDetail(),
  reset(): void {
    this.state = buildInitialChannelDetail()
  },
}
