import type { ObjectStorage } from "../domain/services/ObjectStorage"

export class FakeObjectStorage implements ObjectStorage {
  downloadCalls: { url: string; destPath: string }[] = []
  uploadCalls: { localPath: string; key: string }[] = []

  download(url: string, destPath: string): Promise<void> {
    this.downloadCalls.push({ url, destPath })
    return Promise.resolve()
  }

  upload(localPath: string, key: string): Promise<string> {
    this.uploadCalls.push({ localPath, key })
    return Promise.resolve(`https://cdn.example.com/${key}`)
  }
}
