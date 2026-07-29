export interface HttpErrorMapping {
  statusCode: number
  code: string
}

const MAPPING: Record<string, HttpErrorMapping> = {
  EmailAlreadyExistsError: { statusCode: 409, code: "EMAIL_ALREADY_EXISTS" },
  InvalidCredentialsError: { statusCode: 401, code: "INVALID_CREDENTIALS" },
  RefreshTokenInvalidError: { statusCode: 401, code: "INVALID_REFRESH_TOKEN" },
  MembershipAlreadyExistsError: { statusCode: 409, code: "MEMBERSHIP_ALREADY_EXISTS" },
  InvitationExpiredError: { statusCode: 410, code: "INVITATION_EXPIRED" },
}

/** Falls back to a generic 500 for anything not explicitly mapped. */
export function mapDomainErrorToHttp(error: unknown): HttpErrorMapping {
  if (error instanceof Error) {
    const mapped = MAPPING[error.name]
    if (mapped) {
      return mapped
    }
  }
  return { statusCode: 500, code: "INTERNAL_ERROR" }
}
