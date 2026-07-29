import { OAuthExchangeFailedError } from "../../../domain/channel-management/errors/OAuthExchangeFailedError"
import type {
  OAuthExchangeResult,
  SocialOAuthAdapterRegistry,
} from "../../../domain/channel-management/services/SocialOAuthAdapter"
import type { SocialAccountPlatform } from "../../../domain/channel-management/types"

export async function exchangeOAuthCode(
  oauthAdapters: SocialOAuthAdapterRegistry,
  platform: SocialAccountPlatform,
  code: string,
): Promise<OAuthExchangeResult> {
  const adapter = oauthAdapters[platform]
  if (!adapter) {
    throw new Error(`No OAuth adapter registered for platform "${platform}"`)
  }
  try {
    return await adapter.exchangeCode(code)
  } catch (error) {
    if (error instanceof OAuthExchangeFailedError) throw error
    throw new OAuthExchangeFailedError(error instanceof Error ? error.message : "unknown error")
  }
}
