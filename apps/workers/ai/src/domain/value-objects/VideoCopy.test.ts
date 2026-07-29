import { InvalidVideoCopyError } from "../errors/InvalidVideoCopyError"
import { VideoCopy } from "./VideoCopy"

describe("VideoCopy", () => {
  it("should create a video copy with valid fields", () => {
    const copy = VideoCopy.create("Title", "Description", ["#a", "#b"], "Segue pra não perder")

    expect(copy.title).toBe("Title")
    expect(copy.description).toBe("Description")
    expect(copy.hashtags).toEqual(["#a", "#b"])
    expect(copy.cta).toBe("Segue pra não perder")
  })

  it("should reject an empty title", () => {
    expect(() => VideoCopy.create("", "Description", [], "CTA")).toThrow(InvalidVideoCopyError)
  })

  it("should reject a title longer than 100 characters", () => {
    expect(() => VideoCopy.create("a".repeat(101), "Description", [], "CTA")).toThrow(
      InvalidVideoCopyError,
    )
  })

  it("should reject more than 10 hashtags", () => {
    const hashtags = Array.from({ length: 11 }, (_, i) => `#tag${i}`)
    expect(() => VideoCopy.create("Title", "Description", hashtags, "CTA")).toThrow(
      InvalidVideoCopyError,
    )
  })

  it("should reject an empty CTA", () => {
    expect(() => VideoCopy.create("Title", "Description", [], "")).toThrow(InvalidVideoCopyError)
  })

  it("should reject a CTA longer than 140 characters", () => {
    expect(() => VideoCopy.create("Title", "Description", [], "a".repeat(141))).toThrow(
      InvalidVideoCopyError,
    )
  })
})
