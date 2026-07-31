import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type {
  ContentSourceConfig,
  LocalFolderConfig,
} from "../../../domain/catalog/entities/ContentSourceConfig"
import type {
  ContentSourceProvider,
  DiscoveredContentCandidate,
} from "../../../domain/catalog/services/ContentSourceProvider"

interface ManifestEntry {
  file: string
  durationSeconds: number
}

/**
 * LOCAL_FOLDER — reads a `manifest.json` ({ file, durationSeconds }[]) dropped alongside
 * partner-provided files (e.g. via a shared network folder). `baseUrl` must serve that same
 * folder over HTTP so the returned `storageUrl` is fetchable by the AI/video workers.
 */
export class LocalFolderContentSourceProvider implements ContentSourceProvider {
  readonly type = "LOCAL_FOLDER" as const

  async discover(config: ContentSourceConfig): Promise<DiscoveredContentCandidate[]> {
    const settings = config.settings as LocalFolderConfig
    const manifestPath = join(settings.folderPath, "manifest.json")
    const raw = await readFile(manifestPath, "utf-8")
    const entries = JSON.parse(raw) as ManifestEntry[]
    const base = settings.baseUrl.endsWith("/") ? settings.baseUrl : `${settings.baseUrl}/`

    return entries.map((entry) => ({
      externalRef: entry.file,
      storageUrl: new URL(entry.file, base).toString(),
      durationSeconds: entry.durationSeconds,
    }))
  }
}
