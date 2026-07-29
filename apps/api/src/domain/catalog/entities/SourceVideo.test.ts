import { InvalidSourceVideoStatusTransitionError } from "../errors/InvalidSourceVideoStatusTransitionError"
import { LicenseInfo } from "../value-objects/LicenseInfo"
import { SourceVideo } from "./SourceVideo"

function buildSourceVideo(overrides: Partial<Parameters<typeof SourceVideo.create>[0]> = {}) {
  return SourceVideo.create({
    id: "source-video-1",
    nicheId: "niche-1",
    durationSeconds: 600,
    license: LicenseInfo.create("PUBLIC_DOMAIN", "https://example.com/license"),
    storageUrl: "s3://bucket/source-video-1.mp4",
    ...overrides,
  })
}

describe("SourceVideo", () => {
  it("should be created in PENDING_REVIEW by default", () => {
    expect(buildSourceVideo().status).toBe("PENDING_REVIEW")
  })

  it("should approve a PENDING_REVIEW video", () => {
    expect(buildSourceVideo().approve().status).toBe("APPROVED")
  })

  it("should reject a PENDING_REVIEW video", () => {
    expect(buildSourceVideo().reject().status).toBe("REJECTED")
  })

  it("should not approve a video that is not PENDING_REVIEW", () => {
    const approved = buildSourceVideo().approve()

    expect(() => approved.approve()).toThrow(InvalidSourceVideoStatusTransitionError)
  })

  it("should not reject a video that is not PENDING_REVIEW", () => {
    const rejected = buildSourceVideo().reject()

    expect(() => rejected.reject()).toThrow(InvalidSourceVideoStatusTransitionError)
  })
})
