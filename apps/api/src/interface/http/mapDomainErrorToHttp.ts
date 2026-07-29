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
  NicheNotFoundError: { statusCode: 404, code: "NICHE_NOT_FOUND" },
  PlanNotFoundError: { statusCode: 404, code: "PLAN_NOT_FOUND" },
  DowngradeBlockedByUsageError: { statusCode: 422, code: "DOWNGRADE_BLOCKED_BY_USAGE" },
  StripeCheckoutError: { statusCode: 502, code: "STRIPE_ERROR" },
  InvalidWebhookSignatureError: { statusCode: 400, code: "INVALID_SIGNATURE" },
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
