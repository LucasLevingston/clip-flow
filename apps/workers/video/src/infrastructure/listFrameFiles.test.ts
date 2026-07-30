import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { listFrameFiles } from "./listFrameFiles"

describe("listFrameFiles", () => {
  it("should return only frame files, sorted, capped at maxCount", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "listFrameFiles-"))
    try {
      await writeFile(path.join(dir, "frame-002.jpg"), "")
      await writeFile(path.join(dir, "frame-001.jpg"), "")
      await writeFile(path.join(dir, "frame-003.jpg"), "")
      await writeFile(path.join(dir, "not-a-frame.txt"), "")

      const result = await listFrameFiles(dir, 2)

      expect(result).toEqual([path.join(dir, "frame-001.jpg"), path.join(dir, "frame-002.jpg")])
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
