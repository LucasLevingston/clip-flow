import { validateRequiredEnv } from "./validateRequiredEnv"

const REQUIRED_VARS = [
  "JWT_PRIVATE_KEY",
  "JWT_PUBLIC_KEY",
  "OAUTH_STATE_SECRET",
  "APP_ENCRYPTION_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "YOUTUBE_CLIENT_ID",
  "YOUTUBE_CLIENT_SECRET",
  "YOUTUBE_REDIRECT_URI",
  "TIKTOK_CLIENT_KEY",
  "TIKTOK_CLIENT_SECRET",
  "TIKTOK_REDIRECT_URI",
]

function setAllRequiredVars(): void {
  for (const name of REQUIRED_VARS) {
    process.env[name] = "value"
  }
}

describe("validateRequiredEnv", () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it("should not throw when every required variable is set", () => {
    setAllRequiredVars()

    expect(() => validateRequiredEnv()).not.toThrow()
  })

  it("should throw listing every missing variable", () => {
    setAllRequiredVars()
    delete process.env.JWT_PRIVATE_KEY
    delete process.env.STRIPE_SECRET_KEY

    expect(() => validateRequiredEnv()).toThrow(
      "Missing required environment variable(s): JWT_PRIVATE_KEY, STRIPE_SECRET_KEY",
    )
  })

  it("should treat an empty string as missing", () => {
    setAllRequiredVars()
    process.env.OAUTH_STATE_SECRET = ""

    expect(() => validateRequiredEnv()).toThrow("OAUTH_STATE_SECRET")
  })
})
