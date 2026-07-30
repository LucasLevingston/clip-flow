import type { TempWorkspace } from "../domain/services/TempWorkspace"

export class FakeTempWorkspace implements TempWorkspace {
  cleanedUp: string[] = []

  create(): Promise<string> {
    return Promise.resolve("/tmp/fake-workspace")
  }

  cleanup(dir: string): Promise<void> {
    this.cleanedUp.push(dir)
    return Promise.resolve()
  }
}
