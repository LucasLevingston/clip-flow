import { InvalidLicenseInfoError } from "../errors/InvalidLicenseInfoError"
import type { LicenseType } from "../types"

/** ADR-0006 — no SourceVideo may exist without a documented license chain. */
export class LicenseInfo {
  private constructor(
    private readonly licenseTypeValue: LicenseType,
    private readonly licenseReferenceValue: string,
  ) {}

  static create(licenseType: LicenseType, licenseReference: string): LicenseInfo {
    if (licenseReference.trim().length === 0) {
      throw new InvalidLicenseInfoError("licenseReference must not be empty")
    }
    return new LicenseInfo(licenseType, licenseReference.trim())
  }

  get licenseType(): LicenseType {
    return this.licenseTypeValue
  }

  get licenseReference(): string {
    return this.licenseReferenceValue
  }
}
