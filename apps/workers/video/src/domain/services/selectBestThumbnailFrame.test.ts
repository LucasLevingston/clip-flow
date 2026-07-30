import { selectBestThumbnailFrame } from "./selectBestThumbnailFrame"

const frames = [
  { framePath: "a.jpg", faceCenterX: null, faceCenterY: null, sharpness: 10 },
  { framePath: "b.jpg", faceCenterX: null, faceCenterY: null, sharpness: 40 },
  { framePath: "c.jpg", faceCenterX: null, faceCenterY: null, sharpness: 25 },
]

describe("selectBestThumbnailFrame", () => {
  it("should return null when thumbnails are disabled", () => {
    expect(selectBestThumbnailFrame(frames, false)).toBeNull()
  })

  it("should return null when there are no sampled frames", () => {
    expect(selectBestThumbnailFrame([], true)).toBeNull()
  })

  it("should return the sharpest frame among the samples", () => {
    expect(selectBestThumbnailFrame(frames, true)).toBe("b.jpg")
  })
})
