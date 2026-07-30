/** Scratch directory for one job's cut/frames/encode pipeline — always cleaned up in `finally`. */
export interface TempWorkspace {
  create(): Promise<string>
  cleanup(dir: string): Promise<void>
}
