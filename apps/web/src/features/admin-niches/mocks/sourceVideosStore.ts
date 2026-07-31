import type { SourceVideoAdmin } from "../types"

const initial: SourceVideoAdmin[] = [
  {
    id: "source-video-1",
    nicheId: "niche-1",
    durationSeconds: 600,
    licenseType: "PUBLIC_DOMAIN",
    licenseReference: "https://example.com/license",
    status: "PENDING_REVIEW",
    storageUrl: "s3://bucket/video.mp4",
    createdAt: "2026-07-30T00:00:00.000Z",
  },
]

export const sourceVideosStore = {
  items: initial.map((sourceVideo) => ({ ...sourceVideo })),
  reset(): void {
    this.items = initial.map((sourceVideo) => ({ ...sourceVideo }))
  },
}
