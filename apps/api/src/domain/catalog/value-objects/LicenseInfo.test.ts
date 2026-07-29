import { InvalidLicenseInfoError } from "../errors/InvalidLicenseInfoError"
import { LicenseInfo } from "./LicenseInfo"

describe("LicenseInfo", () => {
  it("should create a license info with a trimmed reference", () => {
    const license = LicenseInfo.create("CREATIVE_COMMONS", "  https://example.com/license  ")

    expect(license.licenseType).toBe("CREATIVE_COMMONS")
    expect(license.licenseReference).toBe("https://example.com/license")
  })

  it("should reject an empty license reference", () => {
    expect(() => LicenseInfo.create("PUBLIC_DOMAIN", "   ")).toThrow(InvalidLicenseInfoError)
  })
})
