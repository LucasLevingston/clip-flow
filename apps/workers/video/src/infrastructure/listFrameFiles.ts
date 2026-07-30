import { readdir } from "node:fs/promises"
import path from "node:path"

export async function listFrameFiles(outputDir: string, maxCount: number): Promise<string[]> {
  const entries = await readdir(outputDir)
  return entries
    .filter((entry) => entry.startsWith("frame-"))
    .sort()
    .slice(0, maxCount)
    .map((entry) => path.join(outputDir, entry))
}
