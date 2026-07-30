import { readFile, writeFile } from "node:fs/promises"
import type { SupabaseClient } from "@supabase/supabase-js"
import { ObjectStorageError } from "../domain/errors/ObjectStorageError"
import type { ObjectStorage } from "../domain/services/ObjectStorage"

/** Download is a plain HTTPS fetch (storageUrl is any fetchable URL); upload targets Supabase Storage. */
export class SupabaseObjectStorageAdapter implements ObjectStorage {
  constructor(
    private readonly client: SupabaseClient,
    private readonly bucket: string,
  ) {}

  async download(url: string, destPath: string): Promise<void> {
    const response = await fetch(url)
    const buffer = Buffer.from(await response.arrayBuffer())
    await writeFile(destPath, buffer)
  }

  async upload(localPath: string, key: string): Promise<string> {
    const fileBuffer = await readFile(localPath)
    const { error } = await this.client.storage.from(this.bucket).upload(key, fileBuffer, {
      upsert: true,
    })
    if (error) {
      throw new ObjectStorageError(error.message)
    }
    const { data } = this.client.storage.from(this.bucket).getPublicUrl(key)
    return data.publicUrl
  }
}
