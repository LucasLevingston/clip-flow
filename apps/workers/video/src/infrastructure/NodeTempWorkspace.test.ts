import { access } from "node:fs/promises"
import { NodeTempWorkspace } from "./NodeTempWorkspace"

describe("NodeTempWorkspace", () => {
  it("should create a real temp directory and remove it on cleanup", async () => {
    const workspace = new NodeTempWorkspace()

    const dir = await workspace.create()
    await expect(access(dir)).resolves.toBeUndefined()

    await workspace.cleanup(dir)
    await expect(access(dir)).rejects.toThrow()
  })
})
