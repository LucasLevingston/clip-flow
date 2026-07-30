import { escapeFfmpegFilterPath } from "./escapeFfmpegFilterPath"

describe("escapeFfmpegFilterPath", () => {
  it("should normalize backslashes to forward slashes and double-escape colons", () => {
    expect(escapeFfmpegFilterPath("C:\\tmp\\video\\out.srt")).toBe("C\\\\:/tmp/video/out.srt")
  })

  it("should escape colons", () => {
    expect(escapeFfmpegFilterPath("/tmp/out.srt")).toBe("/tmp/out.srt")
  })

  it("should leave a path with neither backslashes nor colons unchanged", () => {
    expect(escapeFfmpegFilterPath("/tmp/a/b.srt")).toBe("/tmp/a/b.srt")
  })
})
