import { render, screen } from "@testing-library/react"
import { VideoTable } from "./VideoTable"
import type { VideoSummary } from "../../types"

function buildVideo(overrides: Partial<VideoSummary>): VideoSummary {
  return {
    id: "video-1",
    channelId: "channel-1",
    status: "PUBLISHED",
    sourceVideoId: "source-1",
    thumbnailUrl: null,
    finalAssetUrl: null,
    scheduledPublishAt: "2026-07-01T09:00:00.000Z",
    createdAt: "2026-07-01T00:00:00.000Z",
    publishRecords: [],
    ...overrides,
  }
}

describe("VideoTable", () => {
  it("should render a placeholder when a video has no publish records yet", () => {
    render(<VideoTable videos={[buildVideo({ status: "READY_TO_PUBLISH" })]} />)

    expect(screen.getByText("Pronto para publicar")).toBeInTheDocument()
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("should list every platform a video was published to", () => {
    render(
      <VideoTable
        videos={[
          buildVideo({
            id: "video-2",
            publishRecords: [
              {
                platform: "YOUTUBE",
                status: "PUBLISHED",
                externalPostId: "yt-1",
                publishedAt: null,
              },
              {
                platform: "TIKTOK",
                status: "PUBLISHED",
                externalPostId: "tt-1",
                publishedAt: null,
              },
            ],
          }),
        ]}
      />,
    )

    expect(screen.getByText("YouTube, TikTok")).toBeInTheDocument()
  })
})
