import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import type { SupabaseClient } from "@supabase/supabase-js"
import { ObjectStorageError } from "../domain/errors/ObjectStorageError"
import { SupabaseObjectStorageAdapter } from "./SupabaseObjectStorageAdapter"

function buildClient(upload: jest.Mock, getPublicUrl: jest.Mock) {
  return { storage: { from: () => ({ upload, getPublicUrl }) } } as unknown as SupabaseClient
}

describe("SupabaseObjectStorageAdapter", () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "object-storage-"))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it("should download a URL to the destination path", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new TextEncoder().encode("video-bytes").buffer),
    })
    const adapter = new SupabaseObjectStorageAdapter(
      buildClient(jest.fn(), jest.fn()),
      "generated-videos",
    )
    const destPath = path.join(dir, "downloaded.mp4")

    await adapter.download("https://cdn/source.mp4", destPath)

    expect(await readFile(destPath, "utf8")).toBe("video-bytes")
  })

  it("should upload a local file and return its public URL", async () => {
    const upload = jest.fn().mockResolvedValue({ error: null })
    const getPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: "https://cdn/generated-videos/final.mp4" },
    })
    const adapter = new SupabaseObjectStorageAdapter(
      buildClient(upload, getPublicUrl),
      "generated-videos",
    )
    const localPath = path.join(dir, "final.mp4")
    await writeFile(localPath, "final-bytes")

    const url = await adapter.upload(localPath, "final.mp4")

    expect(upload).toHaveBeenCalledWith("final.mp4", Buffer.from("final-bytes"), { upsert: true })
    expect(url).toBe("https://cdn/generated-videos/final.mp4")
  })

  it("should throw ObjectStorageError when the upload fails", async () => {
    const upload = jest.fn().mockResolvedValue({ error: { message: "bucket not found" } })
    const adapter = new SupabaseObjectStorageAdapter(
      buildClient(upload, jest.fn()),
      "generated-videos",
    )
    const localPath = path.join(dir, "final.mp4")
    await writeFile(localPath, "final-bytes")

    await expect(adapter.upload(localPath, "final.mp4")).rejects.toThrow(ObjectStorageError)
  })
})
