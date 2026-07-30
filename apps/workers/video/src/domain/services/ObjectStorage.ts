export interface ObjectStorage {
  download(url: string, destPath: string): Promise<void>
  upload(localPath: string, key: string): Promise<string>
}
