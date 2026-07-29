export class InvalidVideoCopyError extends Error {
  constructor(reason: string) {
    super(`Invalid video copy: ${reason}`)
    this.name = "InvalidVideoCopyError"
  }
}
