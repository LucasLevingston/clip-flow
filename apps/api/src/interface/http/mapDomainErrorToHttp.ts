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
  PlanLimitExceededError: { statusCode: 422, code: "PLAN_LIMIT_EXCEEDED" },
  NicheInactiveError: { statusCode: 422, code: "NICHE_INACTIVE" },
  PublishTimesCountMismatchError: { statusCode: 422, code: "PUBLISH_TIMES_COUNT_MISMATCH" },
  ChannelNotFoundError: { statusCode: 404, code: "CHANNEL_NOT_FOUND" },
  NicheImmutableError: { statusCode: 422, code: "NICHE_IMMUTABLE" },
  ChannelNotReadyError: { statusCode: 422, code: "CHANNEL_NOT_READY" },
  ChannelNotActiveError: { statusCode: 409, code: "CHANNEL_NOT_ACTIVE" },
  SocialAccountAlreadyConnectedError: { statusCode: 409, code: "SOCIAL_ACCOUNT_ALREADY_CONNECTED" },
  InvalidOAuthStateError: { statusCode: 400, code: "INVALID_OAUTH_STATE" },
  OAuthExchangeFailedError: { statusCode: 502, code: "OAUTH_EXCHANGE_FAILED" },
  SocialAccountNotFoundError: { statusCode: 404, code: "SOCIAL_ACCOUNT_NOT_FOUND" },
  SourceVideoNotFoundError: { statusCode: 404, code: "SOURCE_VIDEO_NOT_FOUND" },
  SourceVideoNotPendingError: { statusCode: 409, code: "SOURCE_VIDEO_NOT_PENDING" },
  InvalidLicenseInfoError: { statusCode: 422, code: "INVALID_LICENSE_INFO" },
  GeneratedVideoNotFoundError: { statusCode: 404, code: "VIDEO_NOT_FOUND" },
  GeneratedVideoNotPendingModerationError: {
    statusCode: 409,
    code: "VIDEO_NOT_PENDING_MODERATION",
  },
  NotificationNotFoundError: { statusCode: 404, code: "NOTIFICATION_NOT_FOUND" },
  InvalidNotificationCategoryError: { statusCode: 422, code: "INVALID_CATEGORY" },
  VideoNotFoundError: { statusCode: 404, code: "VIDEO_NOT_FOUND" },
  SlugAlreadyExistsError: { statusCode: 409, code: "SLUG_ALREADY_EXISTS" },
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
