import { DowngradeBlockedByUsageError } from "../../domain/billing/errors/DowngradeBlockedByUsageError"
import { PlanLimitExceededError } from "../../domain/billing/errors/PlanLimitExceededError"
import { StripeCheckoutError } from "../../domain/billing/errors/StripeCheckoutError"
import { ChannelNotReadyError } from "../../domain/channel-management/errors/ChannelNotReadyError"
import { InvalidOAuthStateError } from "../../domain/channel-management/errors/InvalidOAuthStateError"
import { NicheImmutableError } from "../../domain/channel-management/errors/NicheImmutableError"
import { OAuthExchangeFailedError } from "../../domain/channel-management/errors/OAuthExchangeFailedError"
import { SocialAccountAlreadyConnectedError } from "../../domain/channel-management/errors/SocialAccountAlreadyConnectedError"
import { SocialAccountNotFoundError } from "../../domain/channel-management/errors/SocialAccountNotFoundError"
import { InvalidLicenseInfoError } from "../../domain/catalog/errors/InvalidLicenseInfoError"
import { SourceVideoNotFoundError } from "../../domain/catalog/errors/SourceVideoNotFoundError"
import { SourceVideoNotPendingError } from "../../domain/catalog/errors/SourceVideoNotPendingError"
import { GeneratedVideoNotFoundError } from "../../domain/content-generation/errors/GeneratedVideoNotFoundError"
import { GeneratedVideoNotPendingModerationError } from "../../domain/content-generation/errors/GeneratedVideoNotPendingModerationError"
import { EmailAlreadyExistsError } from "../../domain/identity/errors/EmailAlreadyExistsError"
import { InvalidNotificationCategoryError } from "../../domain/notifications/errors/InvalidNotificationCategoryError"
import { NotificationNotFoundError } from "../../domain/notifications/errors/NotificationNotFoundError"
import { VideoNotFoundError } from "../../domain/videos/errors/VideoNotFoundError"
import { mapDomainErrorToHttp } from "./mapDomainErrorToHttp"

describe("mapDomainErrorToHttp", () => {
  it("should map a known domain error to its HTTP status and code", () => {
    expect(mapDomainErrorToHttp(new EmailAlreadyExistsError("a@b.com"))).toEqual({
      statusCode: 409,
      code: "EMAIL_ALREADY_EXISTS",
    })
  })

  it("should map DowngradeBlockedByUsageError to 422", () => {
    expect(mapDomainErrorToHttp(new DowngradeBlockedByUsageError(["channels"]))).toEqual({
      statusCode: 422,
      code: "DOWNGRADE_BLOCKED_BY_USAGE",
    })
  })

  it("should map StripeCheckoutError to 502", () => {
    expect(mapDomainErrorToHttp(new StripeCheckoutError("timeout"))).toEqual({
      statusCode: 502,
      code: "STRIPE_ERROR",
    })
  })

  it("should map PlanLimitExceededError to 422", () => {
    expect(mapDomainErrorToHttp(new PlanLimitExceededError("channels"))).toEqual({
      statusCode: 422,
      code: "PLAN_LIMIT_EXCEEDED",
    })
  })

  it("should map NicheImmutableError to 422", () => {
    expect(mapDomainErrorToHttp(new NicheImmutableError())).toEqual({
      statusCode: 422,
      code: "NICHE_IMMUTABLE",
    })
  })

  it("should map ChannelNotReadyError to 422", () => {
    expect(mapDomainErrorToHttp(new ChannelNotReadyError())).toEqual({
      statusCode: 422,
      code: "CHANNEL_NOT_READY",
    })
  })

  it("should map SocialAccountAlreadyConnectedError to 409", () => {
    expect(mapDomainErrorToHttp(new SocialAccountAlreadyConnectedError("YOUTUBE"))).toEqual({
      statusCode: 409,
      code: "SOCIAL_ACCOUNT_ALREADY_CONNECTED",
    })
  })

  it("should map InvalidOAuthStateError to 400", () => {
    expect(mapDomainErrorToHttp(new InvalidOAuthStateError())).toEqual({
      statusCode: 400,
      code: "INVALID_OAUTH_STATE",
    })
  })

  it("should map OAuthExchangeFailedError to 502", () => {
    expect(mapDomainErrorToHttp(new OAuthExchangeFailedError("timeout"))).toEqual({
      statusCode: 502,
      code: "OAUTH_EXCHANGE_FAILED",
    })
  })

  it("should map SocialAccountNotFoundError to 404", () => {
    expect(mapDomainErrorToHttp(new SocialAccountNotFoundError("account-1"))).toEqual({
      statusCode: 404,
      code: "SOCIAL_ACCOUNT_NOT_FOUND",
    })
  })

  it("should map SourceVideoNotFoundError to 404", () => {
    expect(mapDomainErrorToHttp(new SourceVideoNotFoundError("source-video-1"))).toEqual({
      statusCode: 404,
      code: "SOURCE_VIDEO_NOT_FOUND",
    })
  })

  it("should map SourceVideoNotPendingError to 409", () => {
    expect(mapDomainErrorToHttp(new SourceVideoNotPendingError("source-video-1"))).toEqual({
      statusCode: 409,
      code: "SOURCE_VIDEO_NOT_PENDING",
    })
  })

  it("should map InvalidLicenseInfoError to 422", () => {
    expect(mapDomainErrorToHttp(new InvalidLicenseInfoError("empty reference"))).toEqual({
      statusCode: 422,
      code: "INVALID_LICENSE_INFO",
    })
  })

  it("should map GeneratedVideoNotFoundError to 404", () => {
    expect(mapDomainErrorToHttp(new GeneratedVideoNotFoundError("generated-1"))).toEqual({
      statusCode: 404,
      code: "VIDEO_NOT_FOUND",
    })
  })

  it("should map GeneratedVideoNotPendingModerationError to 409", () => {
    expect(
      mapDomainErrorToHttp(new GeneratedVideoNotPendingModerationError("generated-1")),
    ).toEqual({ statusCode: 409, code: "VIDEO_NOT_PENDING_MODERATION" })
  })

  it("should map NotificationNotFoundError to 404", () => {
    expect(mapDomainErrorToHttp(new NotificationNotFoundError("notif-1"))).toEqual({
      statusCode: 404,
      code: "NOTIFICATION_NOT_FOUND",
    })
  })

  it("should map InvalidNotificationCategoryError to 422", () => {
    expect(mapDomainErrorToHttp(new InvalidNotificationCategoryError("NotReal"))).toEqual({
      statusCode: 422,
      code: "INVALID_CATEGORY",
    })
  })

  it("should map VideoNotFoundError to 404", () => {
    expect(mapDomainErrorToHttp(new VideoNotFoundError("video-1"))).toEqual({
      statusCode: 404,
      code: "VIDEO_NOT_FOUND",
    })
  })

  it("should fall back to a generic 500 for an unmapped Error", () => {
    expect(mapDomainErrorToHttp(new Error("boom"))).toEqual({
      statusCode: 500,
      code: "INTERNAL_ERROR",
    })
  })

  it("should fall back to a generic 500 for a non-Error value", () => {
    expect(mapDomainErrorToHttp("boom")).toEqual({ statusCode: 500, code: "INTERNAL_ERROR" })
  })
})
