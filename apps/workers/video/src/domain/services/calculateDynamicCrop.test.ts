import { calculateDynamicCrop } from "./calculateDynamicCrop"

describe("calculateDynamicCrop", () => {
  it("should center the crop on the video when no face was detected", () => {
    const crop = calculateDynamicCrop(null, 1_920, 1_080)

    expect(crop).toEqual({ x: 656, y: 0, width: 608, height: 1_080 })
  })

  it("should center the crop on the detected face", () => {
    const crop = calculateDynamicCrop({ x: 200, y: 400 }, 1_920, 1_080)

    expect(crop.x).toBe(0)
    expect(crop.width).toBe(608)
  })

  it("should clamp the crop so it never exceeds the video width on the right edge", () => {
    const crop = calculateDynamicCrop({ x: 1_900, y: 400 }, 1_920, 1_080)

    expect(crop.x).toBe(1_920 - 608)
  })

  it("should not crop wider than the source video", () => {
    const crop = calculateDynamicCrop(null, 400, 1_080)

    expect(crop.width).toBe(400)
  })
})
