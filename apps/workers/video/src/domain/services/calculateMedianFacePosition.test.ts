import { calculateMedianFacePosition } from "./calculateMedianFacePosition"

describe("calculateMedianFacePosition", () => {
  it("should return null when no frame has a detected face", () => {
    const result = calculateMedianFacePosition([
      { framePath: "a.jpg", faceCenterX: null, faceCenterY: null, sharpness: 10 },
    ])

    expect(result).toBeNull()
  })

  it("should return the single position when only one frame has a face", () => {
    const result = calculateMedianFacePosition([
      { framePath: "a.jpg", faceCenterX: 100, faceCenterY: 200, sharpness: 10 },
    ])

    expect(result).toEqual({ x: 100, y: 200 })
  })

  it("should return the median position across an odd number of frames", () => {
    const result = calculateMedianFacePosition([
      { framePath: "a.jpg", faceCenterX: 100, faceCenterY: 100, sharpness: 10 },
      { framePath: "b.jpg", faceCenterX: 300, faceCenterY: 300, sharpness: 10 },
      { framePath: "c.jpg", faceCenterX: 200, faceCenterY: 200, sharpness: 10 },
    ])

    expect(result).toEqual({ x: 200, y: 200 })
  })

  it("should average the two middle positions for an even number of frames", () => {
    const result = calculateMedianFacePosition([
      { framePath: "a.jpg", faceCenterX: 100, faceCenterY: 100, sharpness: 10 },
      { framePath: "b.jpg", faceCenterX: 200, faceCenterY: 200, sharpness: 10 },
    ])

    expect(result).toEqual({ x: 150, y: 150 })
  })

  it("should ignore frames without a detected face when computing the median", () => {
    const result = calculateMedianFacePosition([
      { framePath: "a.jpg", faceCenterX: 100, faceCenterY: 100, sharpness: 10 },
      { framePath: "b.jpg", faceCenterX: null, faceCenterY: null, sharpness: 10 },
    ])

    expect(result).toEqual({ x: 100, y: 100 })
  })
})
