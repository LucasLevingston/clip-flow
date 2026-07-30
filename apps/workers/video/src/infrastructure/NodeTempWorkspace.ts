import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import type { TempWorkspace } from "../domain/services/TempWorkspace"

export class NodeTempWorkspace implements TempWorkspace {
  create(): Promise<string> {
    return mkdtemp(path.join(tmpdir(), "clip-flow-video-"))
  }

  async cleanup(dir: string): Promise<void> {
    await rm(dir, { recursive: true, force: true })
  }
}
